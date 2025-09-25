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
        let days = 30;

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                days = 7;
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                days = 30;
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                days = 90;
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                days = 365;
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Generate date range for chart data
        const chartData: Array<{
            date: string;
            users: number;
            sessions: number;
            revenue: number;
            readers: number;
        }> = [];
        const dateInterval = Math.max(1, Math.floor(days / 30)); // Max 30 data points

        for (let i = 0; i < days; i += dateInterval) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + dateInterval);

            // Get users registered on this date
            const users = await db.user.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            // Get sessions created on this date
            const sessions = await db.session.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            // Get revenue generated on this date
            const revenueResult = await db.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                },
                _sum: {
                    amount: true
                }
            });

            // Get readers active on this date
            const readers = await db.user.count({
                where: {
                    role: 'READER',
                    readerProfile: {
                        status: 'ONLINE'
                    },
                    createdAt: {
                        lte: nextDate
                    }
                }
            });

            chartData.push({
                date: date.toISOString().split('T')[0],
                users,
                sessions,
                revenue: revenueResult._sum.amount || 0,
                readers
            });
        }

        return NextResponse.json({ chartData });

    } catch (error) {
        console.error('Chart data error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}