import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

const getSessionsSchema = z.object({
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    type: z.enum(['CHAT', 'CALL', 'VIDEO']).optional(),
    clientId: z.string().optional(),
    readerId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
})

const updateSessionSchema = z.object({
    sessionId: z.string(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    refundAmount: z.number().min(0).optional(), // For cancellations with refund
    notes: z.string().max(500).optional(),
})

// GET /api/admin/sessions - Get all sessions with filtering (Admin only)
export async function GET(request: NextRequest) {
    return withRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
        try {
            const { searchParams } = new URL(request.url)
            const validatedParams = getSessionsSchema.parse({
                status: searchParams.get('status'),
                type: searchParams.get('type'),
                clientId: searchParams.get('clientId'),
                readerId: searchParams.get('readerId'),
                startDate: searchParams.get('startDate'),
                endDate: searchParams.get('endDate'),
                limit: searchParams.get('limit'),
                offset: searchParams.get('offset'),
            })

            let whereClause: any = {}

            if (validatedParams.status) {
                whereClause.status = validatedParams.status
            }

            if (validatedParams.type) {
                whereClause.type = validatedParams.type
            }

            if (validatedParams.clientId) {
                whereClause.clientId = validatedParams.clientId
            }

            if (validatedParams.readerId) {
                whereClause.readerId = validatedParams.readerId
            }

            if (validatedParams.startDate || validatedParams.endDate) {
                whereClause.createdAt = {}
                if (validatedParams.startDate) {
                    whereClause.createdAt.gte = new Date(validatedParams.startDate)
                }
                if (validatedParams.endDate) {
                    whereClause.createdAt.lte = new Date(validatedParams.endDate)
                }
            }

            const sessions = await db.session.findMany({
                where: whereClause,
                include: {
                    client: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            clientProfile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                }
                            }
                        }
                    },
                    reader: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            readerProfile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                    status: true,
                                }
                            }
                        }
                    },
                    review: {
                        select: {
                            id: true,
                            rating: true,
                            comment: true,
                            createdAt: true,
                        }
                    },
                    transactions: {
                        select: {
                            id: true,
                            type: true,
                            amount: true,
                            status: true,
                            createdAt: true,
                        }
                    },
                    _count: {
                        select: {
                            chatMessages: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: validatedParams.limit,
                skip: validatedParams.offset,
            })

            const totalCount = await db.session.count({ where: whereClause })

            // Get session statistics
            const sessionStats = await db.session.groupBy({
                by: ['status', 'type'],
                _count: { id: true },
                _sum: { totalCost: true },
                _avg: { duration: true },
            })

            // Get revenue statistics
            const revenueStats = await db.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    }
                },
                _sum: { amount: true },
                _count: { id: true },
            })

            return NextResponse.json({
                sessions,
                pagination: {
                    total: totalCount,
                    limit: validatedParams.limit,
                    offset: validatedParams.offset,
                    pages: Math.ceil(totalCount / validatedParams.limit)
                },
                statistics: {
                    sessions: sessionStats,
                    revenue: {
                        last30Days: revenueStats._sum.amount || 0,
                        transactionCount: revenueStats._count || 0,
                    }
                }
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid query parameters', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Get admin sessions error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// PUT /api/admin/sessions - Update session (Admin only)
export async function PUT(request: NextRequest) {
    return withRole(['ADMIN'])(async (req: AuthenticatedRequest) => {
        try {
            const body = await req.json()
            const validatedData = updateSessionSchema.parse(body)

            // Check if session exists
            const existingSession = await db.session.findUnique({
                where: { id: validatedData.sessionId },
                include: {
                    transactions: true,
                    client: {
                        include: { wallet: true }
                    }
                }
            })

            if (!existingSession) {
                return NextResponse.json(
                    { error: 'Session not found' },
                    { status: 404 }
                )
            }

            const updateData: any = {}
            if (validatedData.status) updateData.status = validatedData.status
            if (validatedData.notes) updateData.notes = validatedData.notes

            // Handle refunds for cancellations
            if (validatedData.status === 'CANCELLED' && validatedData.refundAmount) {
                const refundAmount = validatedData.refundAmount

                // Create refund transaction
                await db.transaction.create({
                    data: {
                        transactionId: `refund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        userId: existingSession.clientId,
                        sessionId: existingSession.id,
                        type: 'REFUND',
                        amount: refundAmount,
                        status: 'COMPLETED',
                        description: `Admin refund for cancelled session ${existingSession.id}`,
                    }
                })

                // Update client wallet balance
                if (existingSession.client.wallet) {
                    await db.wallet.update({
                        where: { userId: existingSession.clientId },
                        data: {
                            balance: {
                                increment: refundAmount
                            }
                        }
                    })
                }
            }

            const updatedSession = await db.session.update({
                where: { id: validatedData.sessionId },
                data: updateData,
                include: {
                    client: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                        }
                    },
                    reader: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                        }
                    }
                }
            })

            // Log the admin action
            await db.auditLog.create({
                data: {
                    userId: req.user!.userId,
                    action: 'SESSION_UPDATE',
                    entityType: 'Session',
                    entityId: validatedData.sessionId,
                    changes: { ...updateData, refundAmount: validatedData.refundAmount },
                }
            })

            return NextResponse.json({
                message: 'Session updated successfully',
                session: updatedSession
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Update session error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}
