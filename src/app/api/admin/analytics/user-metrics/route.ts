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

        // Calculate previous period for comparison
        const previousPeriodStart = new Date(startDate);
        const periodDiff = now.getTime() - startDate.getTime();
        previousPeriodStart.setTime(startDate.getTime() - periodDiff);

        // Define user metrics to track
        const metrics = [
            'Daily Active Users',
            'Session Duration',
            'User Retention',
            'Conversion Rate',
            'Revenue Per User',
            'Churn Rate',
            'Page Views',
            'Bounce Rate'
        ];

        const userMetrics: Array<{
            metric: string;
            current: number;
            previous: number;
            change: number;
            trend: 'up' | 'down' | 'stable';
        }> = [];

        for (const metric of metrics) {
            let current = 0;
            let previous = 0;
            let change = 0;
            let trend: 'up' | 'down' | 'stable' = 'stable';

            switch (metric) {
                case 'Daily Active Users':
                    // Users active in the last 7 days within the current period
                    const activeUsersDate = new Date(now);
                    activeUsersDate.setDate(now.getDate() - 7);

                    current = await db.user.count({
                        where: {
                            OR: [
                                {
                                    clientSessions: {
                                        some: {
                                            createdAt: {
                                                gte: Math.max(activeUsersDate.getTime(), startDate.getTime())
                                                    ? new Date(Math.max(activeUsersDate.getTime(), startDate.getTime()))
                                                    : startDate
                                            }
                                        }
                                    }
                                },
                                {
                                    readerSessions: {
                                        some: {
                                            createdAt: {
                                                gte: Math.max(activeUsersDate.getTime(), startDate.getTime())
                                                    ? new Date(Math.max(activeUsersDate.getTime(), startDate.getTime()))
                                                    : startDate
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    });

                    // Previous period active users
                    const prevActiveDate = new Date(previousPeriodStart);
                    prevActiveDate.setDate(previousPeriodStart.getDate() + 7);

                    previous = await db.user.count({
                        where: {
                            OR: [
                                {
                                    clientSessions: {
                                        some: {
                                            createdAt: {
                                                gte: previousPeriodStart,
                                                lt: prevActiveDate
                                            }
                                        }
                                    }
                                },
                                {
                                    readerSessions: {
                                        some: {
                                            createdAt: {
                                                gte: previousPeriodStart,
                                                lt: prevActiveDate
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    });
                    break;

                case 'Session Duration':
                    // TODO: Calculate from session start/end times
                    current = 0;
                    previous = 0;
                    break;

                case 'User Retention':
                    // Users who were active in both current and previous periods
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

                    const totalUsersInPreviousPeriod = await db.user.count({
                        where: {
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
                        }
                    });

                    current = totalUsersInPreviousPeriod > 0
                        ? Math.round((retainedUsers / totalUsersInPreviousPeriod) * 100)
                        : 0;
                    // TODO: Calculate actual previous retention rate
                    previous = 0;
                    break;

                case 'Conversion Rate':
                    const newUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: startDate
                            }
                        }
                    });

                    const payingUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: startDate
                            },
                            userTransactions: {
                                some: {
                                    status: 'COMPLETED',
                                    type: 'SESSION_CHARGE'
                                }
                            }
                        }
                    });

                    current = newUsers > 0 ? Math.round((payingUsers / newUsers) * 100) : 0;

                    // Previous period conversion
                    const prevNewUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: previousPeriodStart,
                                lt: startDate
                            }
                        }
                    });

                    const prevPayingUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: previousPeriodStart,
                                lt: startDate
                            },
                            userTransactions: {
                                some: {
                                    status: 'COMPLETED',
                                    type: 'SESSION_CHARGE'
                                }
                            }
                        }
                    });

                    previous = prevNewUsers > 0 ? Math.round((prevPayingUsers / prevNewUsers) * 100) : 0;
                    break;

                case 'Revenue Per User':
                    const totalUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: startDate
                            }
                        }
                    });

                    const totalRevenue = await db.transaction.aggregate({
                        where: {
                            status: 'COMPLETED',
                            type: 'SESSION_CHARGE',
                            createdAt: {
                                gte: startDate
                            }
                        },
                        _sum: {
                            amount: true
                        }
                    });

                    current = totalUsers > 0
                        ? Math.round((totalRevenue._sum.amount || 0) / totalUsers)
                        : 0;

                    // Previous period ARPU
                    const prevTotalUsers = await db.user.count({
                        where: {
                            createdAt: {
                                gte: previousPeriodStart,
                                lt: startDate
                            }
                        }
                    });

                    const prevTotalRevenue = await db.transaction.aggregate({
                        where: {
                            status: 'COMPLETED',
                            type: 'SESSION_CHARGE',
                            createdAt: {
                                gte: previousPeriodStart,
                                lt: startDate
                            }
                        },
                        _sum: {
                            amount: true
                        }
                    });

                    previous = prevTotalUsers > 0
                        ? Math.round((prevTotalRevenue._sum.amount || 0) / prevTotalUsers)
                        : 0;
                    break;

                default:
                    // TODO: Implement calculation for this metric
                    current = 0;
                    previous = 0;
            }

            // Calculate change and trend
            if (previous > 0) {
                change = ((current - previous) / previous) * 100;
            } else {
                change = current > 0 ? 100 : 0;
            }

            if (Math.abs(change) < 2) {
                trend = 'stable';
            } else if (change > 0) {
                trend = 'up';
            } else {
                trend = 'down';
            }

            userMetrics.push({
                metric,
                current,
                previous,
                change,
                trend
            });
        }

        return NextResponse.json({ userMetrics });

    } catch (error) {
        console.error('User metrics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user metrics' },
            { status: 500 }
        );
    }
}