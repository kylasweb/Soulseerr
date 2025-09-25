import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || 'today';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Get all readers
        const readers = await db.reader.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        // Get performance data for each reader
        const readerIds = readers.map(r => r.userId);

        const [sessionCounts, completedCounts, ratings, earnings] = await Promise.all([
            // Total sessions per reader
            db.session.groupBy({
                by: ['readerId'],
                where: {
                    readerId: { in: readerIds },
                    createdAt: { gte: startDate }
                },
                _count: {
                    id: true
                }
            }),

            // Completed sessions per reader
            db.session.groupBy({
                by: ['readerId'],
                where: {
                    readerId: { in: readerIds },
                    status: 'COMPLETED',
                    createdAt: { gte: startDate }
                },
                _count: {
                    id: true
                }
            }),

            // Average ratings per reader
            db.review.groupBy({
                by: ['readerId'],
                where: {
                    readerId: { in: readerIds },
                    createdAt: { gte: startDate }
                },
                _avg: {
                    rating: true
                }
            }),

            // Total earnings per reader
            db.session.groupBy({
                by: ['readerId'],
                where: {
                    readerId: { in: readerIds },
                    status: 'COMPLETED',
                    createdAt: { gte: startDate }
                },
                _sum: {
                    totalCost: true
                }
            })
        ]);

        // Create lookup maps
        const sessionCountMap = sessionCounts.reduce((acc, count) => {
            acc[count.readerId] = count._count.id;
            return acc;
        }, {} as Record<string, number>);

        const completedCountMap = completedCounts.reduce((acc, count) => {
            acc[count.readerId] = count._count.id;
            return acc;
        }, {} as Record<string, number>);

        const ratingsMap = ratings.reduce((acc, rating) => {
            acc[rating.readerId] = rating._avg.rating || 0;
            return acc;
        }, {} as Record<string, number>);

        const earningsMap = earnings.reduce((acc, earning) => {
            // Reader gets the full session cost (platform fees would be deducted separately)
            acc[earning.readerId] = earning._sum.totalCost || 0;
            return acc;
        }, {} as Record<string, number>);

        // Combine data
        const readersWithPerformance = readers.map(reader => ({
            id: reader.id,
            userId: reader.userId,
            name: reader.user.name,
            email: reader.user.email,
            status: reader.status,
            joinedAt: reader.createdAt.toISOString(),
            totalSessions: sessionCountMap[reader.userId] || 0,
            completedSessions: completedCountMap[reader.userId] || 0,
            averageRating: ratingsMap[reader.userId] || 0,
            totalEarnings: earningsMap[reader.userId] || 0
        }));

        // Sort by total earnings (most successful first)
        readersWithPerformance.sort((a, b) => b.totalEarnings - a.totalEarnings);

        const totalCount = await db.reader.count();

        return NextResponse.json({
            readers: readersWithPerformance,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching reader performance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reader performance data' },
            { status: 500 }
        );
    }
}