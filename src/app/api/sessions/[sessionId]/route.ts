import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

const updateSessionSchema = z.object({
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DISCONNECTED']).optional(),
    notes: z.string().optional(),
    actualDuration: z.number().optional(),
    rating: z.number().min(1).max(5).optional(),
    feedback: z.string().optional(),
})

// GET /api/sessions/[sessionId] - Get specific session
export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = currentUser.userId
        const { sessionId } = await params

        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: {
                client: true,
                reader: {
                    include: {
                        readerProfile: true
                    }
                }
            }
        })

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Check if user has access to this session
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const hasAccess = session.clientId === userId ||
            session.readerId === userId ||
            user.role === 'ADMIN'

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        return NextResponse.json({ session })

    } catch (error) {
        console.error('Get session error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT /api/sessions/[sessionId] - Update specific session
export async function PUT(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json()
        const validatedData = updateSessionSchema.parse(body)
        const userId = currentUser.userId
        const { sessionId } = await params

        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: {
                client: true,
                reader: true
            }
        })

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Check permissions
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isClient = session.clientId === userId
        const isReader = session.readerId === userId
        const isAdmin = user.role === 'ADMIN'

        if (!isClient && !isReader && !isAdmin) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Validate status transitions
        if (validatedData.status) {
            const allowedTransitions: { [key: string]: string[] } = {
                'SCHEDULED': ['IN_PROGRESS', 'CANCELLED'],
                'IN_PROGRESS': ['COMPLETED', 'CANCELLED', 'DISCONNECTED'],
                'COMPLETED': [], // No transitions allowed from completed
                'CANCELLED': [], // No transitions allowed from cancelled
                'NO_SHOW': [], // No transitions allowed from no show
                'DISCONNECTED': ['COMPLETED', 'CANCELLED'], // Can reconnect or cancel
            }

            if (!allowedTransitions[session.status]?.includes(validatedData.status)) {
                return NextResponse.json(
                    { error: `Invalid status transition from ${session.status} to ${validatedData.status}` },
                    { status: 400 }
                )
            }

            // Only readers can start sessions, only participants can end them
            if (validatedData.status === 'IN_PROGRESS' && !isReader && !isAdmin) {
                return NextResponse.json(
                    { error: 'Only readers can start sessions' },
                    { status: 403 }
                )
            }
        }

        // Only clients can rate sessions
        if ((validatedData.rating || validatedData.feedback) && !isClient && !isAdmin) {
            return NextResponse.json(
                { error: 'Only clients can rate sessions' },
                { status: 403 }
            )
        }

        // Update session
        const updatedSession = await db.session.update({
            where: { id: sessionId },
            data: validatedData,
            include: {
                client: {
                    include: { clientProfile: true }
                },
                reader: {
                    include: { readerProfile: true }
                }
            }
        })

        // Handle payment if session is completed
        if (validatedData.status === 'COMPLETED' && session.status !== 'COMPLETED') {
            // Ensure session has a cost before processing payment
            if (!session.totalCost || session.totalCost <= 0) {
                return NextResponse.json(
                    { error: 'Session cost not set, cannot process payment' },
                    { status: 400 }
                )
            }

            // Generate transaction IDs
            const clientTransactionId = `tx_${Date.now()}_client_${session.clientId}`
            const readerTransactionId = `tx_${Date.now()}_reader_${session.readerId}`

            // Deduct from client wallet and add to reader earnings
            await db.$transaction([
                db.wallet.update({
                    where: { userId: session.clientId },
                    data: { balance: { decrement: session.totalCost } }
                }),
                db.transaction.create({
                    data: {
                        transactionId: clientTransactionId,
                        userId: session.clientId,
                        type: 'SESSION_CHARGE',
                        amount: -session.totalCost,
                        description: `Payment for session with reader`,
                        status: 'COMPLETED',
                        sessionId: session.id,
                    }
                }),
                db.transaction.create({
                    data: {
                        transactionId: readerTransactionId,
                        userId: session.readerId,
                        type: 'PAYOUT',
                        amount: session.totalCost * 0.85, // Platform takes 15%
                        description: `Earning from session with client`,
                        status: 'COMPLETED',
                        sessionId: session.id,
                    }
                })
            ])
        }

        return NextResponse.json({
            message: 'Session updated successfully',
            session: updatedSession
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Update session error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}