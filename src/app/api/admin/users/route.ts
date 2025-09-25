import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

const getUsersSchema = z.object({
    role: z.enum(['CLIENT', 'READER', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING', 'BANNED']).optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
})

const updateUserSchema = z.object({
    userId: z.string(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING', 'BANNED']).optional(),
    role: z.enum(['CLIENT', 'READER', 'ADMIN']).optional(),
})

// GET /api/admin/users - Get all users with filtering (Admin only)
export async function GET(request: NextRequest) {
    return withRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
        try {
            const { searchParams } = new URL(request.url)
            const validatedParams = getUsersSchema.parse({
                role: searchParams.get('role'),
                status: searchParams.get('status'),
                search: searchParams.get('search'),
                limit: searchParams.get('limit'),
                offset: searchParams.get('offset'),
            })

            let whereClause: any = {}

            if (validatedParams.role) {
                whereClause.role = validatedParams.role
            }

            if (validatedParams.status) {
                whereClause.status = validatedParams.status
            }

            if (validatedParams.search) {
                whereClause.OR = [
                    { email: { contains: validatedParams.search, mode: 'insensitive' } },
                    { username: { contains: validatedParams.search, mode: 'insensitive' } },
                ]
            }

            const users = await db.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    clientProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        }
                    },
                    readerProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            status: true,
                            isVerified: true,
                            totalSessions: true,
                            totalEarnings: true,
                            averageRating: true,
                        }
                    },
                    adminProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            permissions: true,
                        }
                    },
                    wallet: {
                        select: {
                            id: true,
                            balance: true,
                        }
                    },
                    _count: {
                        select: {
                            clientSessions: true,
                            readerSessions: true,
                            userTransactions: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: validatedParams.limit,
                skip: validatedParams.offset,
            })

            const totalCount = await db.user.count({ where: whereClause })

            // Get user statistics
            const userStats = await db.user.groupBy({
                by: ['role', 'status'],
                _count: { id: true },
            })

            return NextResponse.json({
                users,
                pagination: {
                    total: totalCount,
                    limit: validatedParams.limit,
                    offset: validatedParams.offset,
                    pages: Math.ceil(totalCount / validatedParams.limit)
                },
                statistics: userStats
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid query parameters', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Get admin users error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// PUT /api/admin/users - Update user status/role (Admin only)
export async function PUT(request: NextRequest) {
    return withRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
        try {
            const body = await req.json()
            const validatedData = updateUserSchema.parse(body)

            // Check if user exists
            const existingUser = await db.user.findUnique({
                where: { id: validatedData.userId }
            })

            if (!existingUser) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }

            // Prevent admin from changing their own role or status
            if (existingUser.id === req.user!.userId) {
                return NextResponse.json(
                    { error: 'Cannot modify your own account' },
                    { status: 400 }
                )
            }

            const updateData: any = {}
            if (validatedData.status) updateData.status = validatedData.status
            if (validatedData.role) updateData.role = validatedData.role

            const updatedUser = await db.user.update({
                where: { id: validatedData.userId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    status: true,
                    updatedAt: true,
                }
            })

            // Log the admin action
            await db.auditLog.create({
                data: {
                    userId: req.user!.userId,
                    action: 'USER_UPDATE',
                    entityType: 'User',
                    entityId: validatedData.userId,
                    changes: updateData,
                }
            })

            return NextResponse.json({
                message: 'User updated successfully',
                user: updatedUser
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Update user error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}
