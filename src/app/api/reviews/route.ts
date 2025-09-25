import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

const createReviewSchema = z.object({
    sessionId: z.string(),
    readerId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
    categories: z.record(z.string(), z.number().min(1).max(5)).optional(), // e.g., {"accuracy": 5, "clarity": 4}
})

const getReviewsSchema = z.object({
    readerId: z.string().optional(),
    clientId: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
    minRating: z.coerce.number().min(1).max(5).optional(),
})

// POST /api/reviews - Create a new review
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json()
        const validatedData = createReviewSchema.parse(body)
        const userId = req.user!.userId

        // Verify the session exists and user was the client
        const session = await db.session.findUnique({
            where: { id: validatedData.sessionId },
            include: {
                review: true, // Check if review already exists
            }
        })

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        if (session.clientId !== userId) {
            return NextResponse.json(
                { error: 'Only the client can review this session' },
                { status: 403 }
            )
        }

        if (session.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Can only review completed sessions' },
                { status: 400 }
            )
        }

        if (session.review) {
            return NextResponse.json(
                { error: 'Session already has a review' },
                { status: 400 }
            )
        }

        // Create the review
        const review = await db.review.create({
            data: {
                sessionId: validatedData.sessionId,
                clientId: userId,
                readerId: validatedData.readerId,
                rating: validatedData.rating,
                comment: validatedData.comment,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        username: true,
                        clientProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        })

        // Update reader's average rating
        await updateReaderAverageRating(validatedData.readerId)

        return NextResponse.json({
            message: 'Review created successfully',
            review
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Create review error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const validatedParams = getReviewsSchema.parse({
            readerId: searchParams.get('readerId'),
            clientId: searchParams.get('clientId'),
            limit: searchParams.get('limit'),
            offset: searchParams.get('offset'),
            minRating: searchParams.get('minRating'),
        })

        let whereClause: any = {}

        if (validatedParams.readerId) {
            whereClause.readerId = validatedParams.readerId
        }

        if (validatedParams.clientId) {
            whereClause.clientId = validatedParams.clientId
        }

        if (validatedParams.minRating) {
            whereClause.rating = { gte: validatedParams.minRating }
        }

        const reviews = await db.review.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        id: true,
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
                session: {
                    select: {
                        id: true,
                        type: true,
                        duration: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: validatedParams.limit,
            skip: validatedParams.offset,
        })

        const totalCount = await db.review.count({ where: whereClause })

        return NextResponse.json({
            reviews,
            pagination: {
                total: totalCount,
                limit: validatedParams.limit,
                offset: validatedParams.offset,
                pages: Math.ceil(totalCount / validatedParams.limit)
            }
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Get reviews error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to update reader's average rating
async function updateReaderAverageRating(readerId: string) {
    try {
        const stats = await db.review.aggregate({
            where: { readerId },
            _avg: { rating: true },
            _count: { rating: true },
        })

        const averageRating = stats._avg.rating || 0
        const totalReviews = stats._count.rating || 0

        await db.reader.update({
            where: { userId: readerId },
            data: {
                averageRating: parseFloat(averageRating.toFixed(2)),
            }
        })
    } catch (error) {
        console.error('Error updating reader average rating:', error)
    }
}
