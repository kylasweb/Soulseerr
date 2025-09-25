import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Remove if not used or fix import
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;
        let dateFormat: string;
        let dateInterval: number;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFormat = 'YYYY-MM-DD';
                dateInterval = 1; // 1 day
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                dateFormat = 'YYYY-MM-DD';
                dateInterval = 7; // 1 week
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                dateFormat = 'YYYY-MM';
                dateInterval = 30; // 1 month
                break;
            default: // month
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFormat = 'YYYY-MM-DD';
                dateInterval = 1; // 1 day
        }

        // Generate date range array
        const dateRange: Date[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= now) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + dateInterval);
        }

        // Get revenue data for each date
        const revenueData = await Promise.all(
            dateRange.map(async (date) => {
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + dateInterval);

                // Get revenue (completed transactions)
                const revenue = await db.transaction.aggregate({
                    where: {
                        status: 'COMPLETED',
                        type: 'SESSION_CHARGE',
                        createdAt: {
                            gte: date,
                            lt: nextDate
                        }
                    },
                    _sum: {
                        amount: true
                    },
                    _count: true
                });

                // Get commission (20% of revenue)
                const revenueAmount = revenue._sum?.amount || 0;
                const commission = revenueAmount * 0.20;

                // Get payouts for this period
                const payouts = await db.payout.aggregate({
                    where: {
                        status: 'COMPLETED',
                        processedAt: {
                            not: null,
                            gte: date,
                            lt: nextDate
                        }
                    },
                    _sum: {
                        amount: true
                    }
                });

                return {
                    date: date.toISOString().split('T')[0],
                    revenue: revenueAmount,
                    transactions: revenue._count,
                    commission,
                    payouts: payouts._sum.amount || 0
                };
            })
        );

        return NextResponse.json({
            revenueData: revenueData.filter(data =>
                data.revenue > 0 || (data.transactions && data.transactions > 0) || data.payouts > 0
            )
        });
    } catch (error) {
        console.error('Revenue data fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch revenue data' },
            { status: 500 }
        );
    }
}