import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { io } from '@/lib/socket'

const createNotificationSchema = z.object({
    userId: z.string(),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(1000),
    type: z.enum(['SESSION_REMINDER', 'SESSION_STARTED', 'SESSION_ENDED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'REVIEW_RECEIVED', 'NEW_MESSAGE', 'SYSTEM_UPDATE', 'MAINTENANCE', 'PROMOTION']),
    scheduledFor: z.string().datetime().optional(),
})

const getNotificationsSchema = z.object({
    unreadOnly: z.string().transform(val => val === 'true').optional(),
    type: z.enum(['SESSION_REMINDER', 'SESSION_STARTED', 'SESSION_ENDED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'REVIEW_RECEIVED', 'NEW_MESSAGE', 'SYSTEM_UPDATE', 'MAINTENANCE', 'PROMOTION']).optional(),
    limit: z.string().optional().default('50').transform(val => parseInt(val)),
    offset: z.string().optional().default('0').transform(val => parseInt(val)),
})

const markNotificationSchema = z.object({
    notificationIds: z.array(z.string()).min(1),
    action: z.enum(['read', 'unread', 'delete']),
})

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            const { searchParams } = new URL(request.url)
            const validatedParams = getNotificationsSchema.parse({
                unreadOnly: searchParams.get('unreadOnly'),
                type: searchParams.get('type'),
                limit: searchParams.get('limit'),
                offset: searchParams.get('offset'),
            })

            const userId = req.user!.userId

            let whereClause: any = { userId }

            if (validatedParams.unreadOnly) {
                whereClause.isRead = false
            }

            if (validatedParams.type) {
                whereClause.type = validatedParams.type
            }

            // Don't show deleted notifications
            whereClause.deletedAt = null

            const notifications = await db.notification.findMany({
                where: whereClause,
                orderBy: [
                    { createdAt: 'desc' }
                ],
                take: validatedParams.limit,
                skip: validatedParams.offset,
            })

            const totalCount = await db.notification.count({
                where: whereClause
            })

            const unreadCount = await db.notification.count({
                where: {
                    userId,
                    isRead: false,
                }
            })

            return NextResponse.json({
                notifications,
                pagination: {
                    total: totalCount,
                    limit: validatedParams.limit,
                    offset: validatedParams.offset,
                    hasMore: validatedParams.offset + validatedParams.limit < totalCount,
                },
                unreadCount,
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid query parameters', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Get notifications error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            if (req.user!.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: 'Forbidden - Admin access required' },
                    { status: 403 }
                )
            } const body = await request.json()
            const validatedData = createNotificationSchema.parse(body)

            // Verify target user exists
            const targetUser = await db.user.findUnique({
                where: { id: validatedData.userId },
            })

            if (!targetUser) {
                return NextResponse.json(
                    { error: 'Target user not found' },
                    { status: 404 }
                )
            }

            const notification = await db.notification.create({
                data: {
                    userId: validatedData.userId,
                    title: validatedData.title,
                    message: validatedData.message,
                    type: validatedData.type,
                    metadata: validatedData.scheduledFor ? { scheduledFor: validatedData.scheduledFor } : undefined,
                },
            })

            // Send real-time notification if not scheduled for future
            if (!validatedData.scheduledFor || new Date(validatedData.scheduledFor) <= new Date()) {
                io.to(validatedData.userId).emit('notification', {
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    metadata: notification.metadata,
                    createdAt: notification.createdAt,
                })
            }

            return NextResponse.json(notification, { status: 201 })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Create notification error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// PATCH /api/notifications - Mark notifications as read/unread/delete
export async function PATCH(request: NextRequest) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            const body = await request.json()
            const validatedData = markNotificationSchema.parse(body)
            const userId = req.user!.userId

            // Verify all notifications belong to the user
            const notifications = await db.notification.findMany({
                where: {
                    id: { in: validatedData.notificationIds },
                    userId,
                },
                select: { id: true },
            })

            if (notifications.length !== validatedData.notificationIds.length) {
                return NextResponse.json(
                    { error: 'Some notifications not found or access denied' },
                    { status: 404 }
                )
            }

            let updateData: any = {}

            switch (validatedData.action) {
                case 'read':
                    updateData = { isRead: true }
                    break
                case 'unread':
                    updateData = { isRead: false }
                    break
                case 'delete':
                    updateData = { deletedAt: new Date() }
                    break
            }

            await db.notification.updateMany({
                where: {
                    id: { in: validatedData.notificationIds },
                    userId,
                },
                data: updateData,
            })

            // Get updated unread count
            const unreadCount = await db.notification.count({
                where: {
                    userId,
                    isRead: false,
                }
            })

            // Emit updated unread count
            io.to(userId).emit('unread-count-updated', { unreadCount })

            return NextResponse.json({
                message: `Notifications ${validatedData.action === 'delete' ? 'deleted' : `marked as ${validatedData.action}`} successfully`,
                updatedCount: notifications.length,
                unreadCount,
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Update notifications error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}
