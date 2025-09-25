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

        // Calculate date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get financial statistics
        const [
            totalRevenue,
            monthlyRevenue,
            lastMonthRevenue,
            totalTransactions,
            pendingPayouts,
            totalPayouts,
            completedSessions,
            failedTransactions,
            cancelledTransactions,
            refundedTransactions
        ] = await Promise.all([
            // Total revenue from all completed transactions
            db.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    type: 'SESSION_CHARGE'
                },
                _sum: {
                    amount: true
                }
            }),

            // Monthly revenue
            db.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    type: 'SESSION_CHARGE',
                    createdAt: { gte: startOfMonth }
                },
                _sum: {
                    amount: true
                }
            }),

            // Last month revenue for growth calculation
            db.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    type: 'SESSION_CHARGE',
                    createdAt: {
                        gte: lastMonth,
                        lte: endOfLastMonth
                    }
                },
                _sum: {
                    amount: true
                }
            }),

            // Total transactions count
            db.transaction.count(),

            // Pending payouts count
            db.payout.count({
                where: { status: 'PENDING' }
            }),

            // Total payouts amount
            db.payout.aggregate({
                where: { status: 'COMPLETED' },
                _sum: {
                    amount: true
                }
            }),

            // Completed sessions count (completed transactions of type SESSION_CHARGE)
            db.transaction.count({
                where: {
                    type: 'SESSION_CHARGE',
                    status: 'COMPLETED'
                }
            }),

            // Failed transactions count
            db.transaction.count({
                where: { status: 'FAILED' }
            }),

            // Cancelled transactions count
            db.transaction.count({
                where: { status: 'CANCELLED' }
            }),

            // Refunded transactions
            db.transaction.aggregate({
                where: {
                    type: 'REFUND',
                    status: 'COMPLETED'
                },
                _sum: {
                    amount: true
                }
            })
        ]);

        // Calculate derived statistics
        const totalRevenueAmount = totalRevenue._sum.amount || 0;
        const monthlyRevenueAmount = monthlyRevenue._sum.amount || 0;
        const lastMonthRevenueAmount = lastMonthRevenue._sum.amount || 0;

        const revenueGrowth = lastMonthRevenueAmount > 0
            ? ((monthlyRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100
            : 0;

        // Platform commission (assuming 20% platform fee)
        const platformCommission = totalRevenueAmount * 0.20;
        const readerEarnings = totalRevenueAmount * 0.80;

        const averageSessionValue = completedSessions > 0
            ? totalRevenueAmount / completedSessions
            : 0;

        const totalTransactionsCount = totalTransactions || 1;
        const paymentSuccessRate = ((totalTransactionsCount - failedTransactions) / totalTransactionsCount) * 100;

        const refundAmount = refundedTransactions._sum.amount || 0;
        const refundRate = totalRevenueAmount > 0 ? (refundAmount / totalRevenueAmount) * 100 : 0;

        const disputeRate = (cancelledTransactions / totalTransactionsCount) * 100;

        const stats = {
            totalRevenue: totalRevenueAmount,
            monthlyRevenue: monthlyRevenueAmount,
            revenueGrowth,
            totalTransactions: totalTransactionsCount,
            pendingPayouts,
            totalPayouts: totalPayouts._sum.amount || 0,
            platformCommission,
            readerEarnings,
            averageSessionValue,
            refundRate,
            disputeRate,
            paymentSuccessRate
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Financial stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch financial statistics' },
            { status: 500 }
        );
    }
}