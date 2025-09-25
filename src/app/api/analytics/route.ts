import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

const getAnalyticsSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    readerId: z.string().optional(), // For reader-specific analytics
    granularity: z.enum(['day', 'week', 'month']).default('day'),
})

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            const { searchParams } = new URL(request.url)
            const validatedParams = getAnalyticsSchema.parse({
                startDate: searchParams.get('startDate'),
                endDate: searchParams.get('endDate'),
                readerId: searchParams.get('readerId'),
                granularity: searchParams.get('granularity'),
            })

            const userId = req.user!.userId
            const userRole = req.user!.role

            // Set default date range (last 30 days)
            const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date()
            const startDate = validatedParams.startDate ? new Date(validatedParams.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

            let whereClause: any = {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                }
            }

            // Role-based filtering
            if (userRole === 'READER') {
                whereClause.readerId = userId
            } else if (userRole === 'CLIENT') {
                whereClause.clientId = userId
            } else if (validatedParams.readerId && userRole === 'ADMIN') {
                whereClause.readerId = validatedParams.readerId
            }

            // Session analytics
            const sessionStats = await db.session.groupBy({
                by: ['status', 'type'],
                where: whereClause,
                _count: { id: true },
                _sum: { totalCost: true, duration: true },
                _avg: { totalCost: true, duration: true },
            })

            // Revenue analytics
            const revenueStats = await db.transaction.groupBy({
                by: ['type', 'status'],
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    ...(userRole === 'READER' && { userId }),
                    ...(userRole === 'CLIENT' && { userId }),
                },
                _sum: { amount: true },
                _count: { id: true },
            })

            // Time-based session analytics
            let dateGrouping: string
            switch (validatedParams.granularity) {
                case 'week':
                    dateGrouping = "DATE_TRUNC('week', \"createdAt\")"
                    break
                case 'month':
                    dateGrouping = "DATE_TRUNC('month', \"createdAt\")"
                    break
                default:
                    dateGrouping = "DATE_TRUNC('day', \"createdAt\")"
            }

            const timeSeriesData = await db.$queryRaw`
        SELECT 
          ${dateGrouping} as date,
          COUNT(*)::INTEGER as session_count,
          SUM("totalCost")::FLOAT as total_revenue,
          AVG("duration")::FLOAT as avg_duration
        FROM "sessions" 
        WHERE "createdAt" >= ${startDate} 
          AND "createdAt" <= ${endDate}
          ${userRole === 'READER' ? db.$queryRaw`AND "readerId" = ${userId}` : db.$queryRaw``}
          ${userRole === 'CLIENT' ? db.$queryRaw`AND "clientId" = ${userId}` : db.$queryRaw``}
        GROUP BY ${dateGrouping}
        ORDER BY date
      `

            // Review analytics (for readers)
            let reviewStats: any = null
            if (userRole === 'READER' || (userRole === 'ADMIN' && validatedParams.readerId)) {
                const reviewReaderId = userRole === 'READER' ? userId : validatedParams.readerId

                const stats = await db.review.aggregate({
                    where: {
                        readerId: reviewReaderId,
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        }
                    },
                    _count: { id: true },
                    _avg: { rating: true },
                })

                // Rating distribution
                const ratingDistribution = await db.review.groupBy({
                    by: ['rating'],
                    where: {
                        readerId: reviewReaderId,
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        }
                    },
                    _count: { rating: true },
                })

                reviewStats = {
                    _count: stats._count,
                    _avg: stats._avg,
                    ratingDistribution
                }
            }

            // Top performing metrics
            let topMetrics: any = null
            if (userRole === 'ADMIN') {
                // Top readers by revenue
                const topReaders = await db.session.groupBy({
                    by: ['readerId'],
                    where: {
                        status: 'COMPLETED',
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        }
                    },
                    _sum: { totalCost: true },
                    _count: { id: true },
                    orderBy: { _sum: { totalCost: 'desc' } },
                    take: 10,
                })

                // Get reader details
                const readerIds = topReaders.map(r => r.readerId)
                const readerDetails = await db.user.findMany({
                    where: { id: { in: readerIds } },
                    select: {
                        id: true,
                        username: true,
                        readerProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                averageRating: true,
                            }
                        }
                    }
                })

                const topReadersWithDetails = topReaders.map(reader => ({
                    ...reader,
                    details: readerDetails.find(d => d.id === reader.readerId)
                }))

                topMetrics = {
                    topReaders: topReadersWithDetails
                }
            }

            return NextResponse.json({
                period: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    granularity: validatedParams.granularity,
                },
                sessions: {
                    statistics: sessionStats,
                    timeSeries: timeSeriesData,
                },
                revenue: {
                    statistics: revenueStats,
                },
                reviews: reviewStats,
                topMetrics,
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid query parameters', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Get analytics error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}
