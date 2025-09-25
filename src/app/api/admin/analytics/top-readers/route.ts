import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        // Authenticate and authorize
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Get top readers with their performance metrics
        const topReaders = await db.user.findMany({
            where: {
                role: 'READER',
                readerProfile: {
                    status: 'ONLINE'
                }
            },
            include: {
                readerProfile: {
                    select: {
                        averageRating: true,
                        totalSessions: true,
                        totalEarnings: true
                    }
                },
                readerSessions: {
                    where: {
                        createdAt: {
                            gte: startDate
                        }
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                readerProfile: {
                    averageRating: 'desc'
                }
            },
            take: 10
        });

        // Calculate previous period for growth rate
        const previousPeriodStart = new Date(startDate);
        const periodDiff = now.getTime() - startDate.getTime();
        previousPeriodStart.setTime(startDate.getTime() - periodDiff);

        const topReadersData = await Promise.all(
            topReaders.map(async (reader) => {
                // Get previous period sessions for growth calculation
                const previousSessions = await db.session.count({
                    where: {
                        readerId: reader.id,
                        createdAt: {
                            gte: previousPeriodStart,
                            lt: startDate
                        }
                    }
                });

                const currentSessions = reader.readerSessions.length;
                const growthRate = previousSessions > 0
                    ? ((currentSessions - previousSessions) / previousSessions) * 100
                    : currentSessions > 0 ? 100 : 0;

                const totalRevenue = reader.readerProfile?.totalEarnings || 0;

                return {
                    id: reader.id,
                    name: reader.name,
                    avatar: reader.avatar,
                    rating: reader.readerProfile?.averageRating || 0,
                    sessions: currentSessions,
                    revenue: totalRevenue,
                    growthRate
                };
            })
        );

        // Sort by a composite score (rating * sessions * revenue)
        const sortedTopReaders = topReadersData.sort((a, b) => {
            const scoreA = a.rating * a.sessions * (a.revenue / 100);
            const scoreB = b.rating * b.sessions * (b.revenue / 100);
            return scoreB - scoreA;
        });

        return NextResponse.json({ topReaders: sortedTopReaders });

    } catch (error) {
        console.error('Top readers error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch top readers' },
            { status: 500 }
        );
    }
}