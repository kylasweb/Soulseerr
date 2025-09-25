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

        // Get user statistics
        const totalUsers = await db.user.count();
        const newUsersInPeriod = await db.user.count({
            where: {
                createdAt: {
                    gte: startDate
                }
            }
        });

        // Get active users (users with activity in the last 7 days)
        const activeUsersDate = new Date();
        activeUsersDate.setDate(now.getDate() - 7);

        const activeUsers = await db.user.count({
            where: {
                OR: [
                    {
                        clientSessions: {
                            some: {
                                createdAt: {
                                    gte: activeUsersDate
                                }
                            }
                        }
                    },
                    {
                        readerSessions: {
                            some: {
                                createdAt: {
                                    gte: activeUsersDate
                                }
                            }
                        }
                    }
                ]
            }
        });

        const newUsersToday = await db.user.count({
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            }
        });

        // Calculate user growth rate
        const previousPeriodStart = new Date(startDate);
        const periodDiff = now.getTime() - startDate.getTime();
        previousPeriodStart.setTime(startDate.getTime() - periodDiff);

        const previousPeriodUsers = await db.user.count({
            where: {
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            }
        });

        const userGrowthRate = previousPeriodUsers > 0
            ? ((newUsersInPeriod - previousPeriodUsers) / previousPeriodUsers) * 100
            : newUsersInPeriod > 0 ? 100 : 0;

        // Get reader statistics
        const totalReaders = await db.user.count({
            where: {
                role: 'READER'
            }
        });

        const activeReaders = await db.user.count({
            where: {
                role: 'READER',
                readerProfile: {
                    status: 'ONLINE'
                }
            }
        });

        // Get session statistics
        const totalSessions = await db.session.count({
            where: {
                createdAt: {
                    gte: startDate
                }
            }
        });

        const completedSessions = await db.session.count({
            where: {
                createdAt: {
                    gte: startDate
                },
                status: 'COMPLETED'
            }
        });

        const sessionCompletionRate = totalSessions > 0
            ? (completedSessions / totalSessions) * 100
            : 0;

        const sessionsToday = await db.session.count({
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            }
        });

        // Calculate session growth rate
        const previousPeriodSessions = await db.session.count({
            where: {
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            }
        });

        const sessionGrowthRate = previousPeriodSessions > 0
            ? ((totalSessions - previousPeriodSessions) / previousPeriodSessions) * 100
            : totalSessions > 0 ? 100 : 0;

        // Get revenue statistics (from payments table)
        const revenueStats = await db.transaction.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate
                }
            },
            _sum: {
                amount: true
            }
        });

        const totalRevenue = revenueStats._sum.amount || 0;

        const monthlyRevenue = await db.transaction.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), 1)
                }
            },
            _sum: {
                amount: true
            }
        });

        // Calculate revenue growth rate
        const previousPeriodRevenue = await db.transaction.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            },
            _sum: {
                amount: true
            }
        });

        const previousRevenue = previousPeriodRevenue._sum.amount || 0;
        const revenueGrowthRate = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : totalRevenue > 0 ? 100 : 0;

        const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

        // Get reader ratings average
        const ratingStats = await db.reader.aggregate({
            _avg: {
                averageRating: true
            }
        });

        const averageReaderRating = ratingStats._avg.averageRating || 0;

        // TODO: Calculate actual session duration from database
        const averageSessionDuration = 0;

        // Calculate retention rate (users who had activity in both periods)
        const retainedUsers = await db.user.count({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                clientSessions: {
                                    some: {
                                        createdAt: {
                                            gte: previousPeriodStart,
                                            lt: startDate
                                        }
                                    }
                                }
                            },
                            {
                                readerSessions: {
                                    some: {
                                        createdAt: {
                                            gte: previousPeriodStart,
                                            lt: startDate
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        OR: [
                            {
                                clientSessions: {
                                    some: {
                                        createdAt: {
                                            gte: startDate
                                        }
                                    }
                                }
                            },
                            {
                                readerSessions: {
                                    some: {
                                        createdAt: {
                                            gte: startDate
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        });

        const userRetentionRate = previousPeriodUsers > 0
            ? (retainedUsers / previousPeriodUsers) * 100
            : 0;

        // Calculate conversion rate (users who made payments)
        const payingUsers = await db.user.count({
            where: {
                userTransactions: {
                    some: {
                        status: 'COMPLETED',
                        createdAt: {
                            gte: startDate
                        }
                    }
                }
            }
        });

        const conversionRate = newUsersInPeriod > 0
            ? (payingUsers / newUsersInPeriod) * 100
            : 0;

        // TODO: Calculate actual platform metrics
        const platformUptime = 0;
        const responseTime = 0;
        const errorRate = 0;
        const apiCallsToday = 0;
        const dataUsage = 0;
        const systemHealth = 0;

        // Calculate additional metrics
        const readerUtilizationRate = totalReaders > 0
            ? (activeReaders / totalReaders) * 100
            : 0;

        // TODO: Calculate actual reader churn rate
        const readerChurnRate = 0;

        // TODO: Calculate actual churn revenue loss
        const churnRevenueLoss = 0;

        const averageSessionValue = completedSessions > 0
            ? totalRevenue / completedSessions
            : 0;

        const stats = {
            // User Analytics
            totalUsers,
            activeUsers,
            newUsersToday,
            userGrowthRate,
            userRetentionRate,
            averageSessionDuration,

            // Reader Analytics
            totalReaders,
            activeReaders,
            readerUtilizationRate,
            averageReaderRating,
            topPerformingReaders,
            readerChurnRate,

            // Session Analytics
            totalSessions,
            completedSessions,
            sessionCompletionRate,
            averageSessionValue,
            sessionsToday,
            sessionGrowthRate,

            // Revenue Analytics
            totalRevenue,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
            revenueGrowthRate,
            averageRevenuePerUser,
            conversionRate,
            churnRevenueLoss,

            // Platform Analytics
            platformUptime,
            responseTime,
            errorRate,
            apiCallsToday,
            dataUsage,
            systemHealth
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Analytics stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics statistics' },
            { status: 500 }
        );
    }
}