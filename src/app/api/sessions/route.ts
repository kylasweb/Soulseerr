import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { randomUUID } from 'crypto'

const createSessionSchema = z.object({
    readerId: z.string(),
    sessionType: z.enum(['CHAT', 'CALL', 'VIDEO']),
    duration: z.number().min(15).max(180), // 15 minutes to 3 hours
    scheduledAt: z.string().datetime().optional(),
    notes: z.string().optional(),
})

// POST /api/sessions - Create/book a new session
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'CLIENT') {
            return NextResponse.json(
                { error: 'Client access required' },
                { status: 403 }
            );
        }

        const body = await request.json()
        const validatedData = createSessionSchema.parse(body)
        const clientId = currentUser.userId

        // Verify reader exists and is active
        const reader = await db.reader.findFirst({
            where: {
                userId: validatedData.readerId,
                status: 'ONLINE'
            },
            include: { user: true }
        })

        if (!reader) {
            return NextResponse.json(
                { error: 'Reader not found or inactive' },
                { status: 404 }
            )
        }

        // Get client wallet
        const client = await db.user.findFirst({
            where: { id: clientId },
            include: { wallet: true }
        })

        if (!client?.wallet) {
            return NextResponse.json(
                { error: 'Client wallet not found' },
                { status: 404 }
            )
        }

        // Calculate cost based on reader's rate (readers now have pricing JSON)
        const readerRate = 60 // Default $60/hour - can be extracted from reader.pricing later
        const cost = (readerRate / 60) * validatedData.duration

        // Check if client has sufficient balance
        if (!client.wallet || client.wallet.balance < cost) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            )
        }

        // Create session
        const session = await db.session.create({
            data: {
                sessionId: randomUUID(), // Generate unique session ID for WebRTC
                clientId,
                readerId: reader.userId,
                type: validatedData.sessionType,
                status: 'SCHEDULED',
                readerRate,
                totalCost: cost,
                scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
                duration: validatedData.duration,
            },
            include: {
                client: true,
                reader: true
            }
        })

        return NextResponse.json({
            message: 'Session created successfully',
            session
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Create session error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET /api/sessions - Get user's sessions
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = currentUser.userId
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        // Build where clause based on user role
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let whereClause: any = {}
        if (user.role === 'CLIENT') {
            whereClause.clientId = userId
        } else if (user.role === 'READER') {
            whereClause.readerId = userId
        } else if (user.role === 'ADMIN') {
            // Admin can see all sessions
        }

        if (status) {
            whereClause.status = status
        }

        const sessions = await db.session.findMany({
            where: whereClause,
            include: {
                client: {
                    include: { clientProfile: true }
                },
                reader: {
                    include: { readerProfile: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        })

        const totalCount = await db.session.count({ where: whereClause })

        return NextResponse.json({
            sessions,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        })

    } catch (error) {
        console.error('Get sessions error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
