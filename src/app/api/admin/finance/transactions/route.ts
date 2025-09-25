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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type') || 'all';
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';
        const dateRange = searchParams.get('dateRange') || 'all';
        const paymentMethod = searchParams.get('paymentMethod') || 'all';
        const minAmount = searchParams.get('minAmount') || '';
        const maxAmount = searchParams.get('maxAmount') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (type !== 'all') {
            where.type = type;
        }

        if (status !== 'all') {
            where.status = status;
        }

        if (paymentMethod !== 'all') {
            where.paymentMethod = paymentMethod;
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            where.amount = {};
            if (minAmount) where.amount.gte = parseFloat(minAmount);
            if (maxAmount) where.amount.lte = parseFloat(maxAmount);
        }

        // Search filter
        if (search) {
            // For now, just search by transaction ID and description
            // In a real app, you'd need to join with user table
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { transactionId: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarter':
                    startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0);
            }

            where.createdAt = {
                gte: startDate
            };
        }

        // Fetch transactions
        const transactions = await db.transaction.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        // Get total count for pagination
        const totalCount = await db.transaction.count({ where });

        // Format transactions for response
        const formattedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency || 'USD',
            description: transaction.description || `${transaction.type} transaction`,
            userId: transaction.userId,
            user: null, // User data not included for performance
            readerId: transaction.sessionId ? 'N/A' : null, // Reader info not easily accessible
            reader: null, // Reader data not included for performance
            sessionId: transaction.sessionId,
            stripeTransactionId: transaction.transactionId,
            createdAt: transaction.createdAt.toISOString(),
            metadata: transaction.metadata || {}
        }));

        return NextResponse.json({
            transactions: formattedTransactions,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}