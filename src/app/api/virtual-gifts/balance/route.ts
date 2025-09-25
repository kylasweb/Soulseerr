import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's coin balance
        const userAccount = await db.user.findUnique({
            where: { id: user.userId },
            select: { coinBalance: true }
        });

        return NextResponse.json({
            success: true,
            balance: userAccount?.coinBalance || 0
        });

    } catch (error) {
        console.error('Virtual gifts balance API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch balance' },
            { status: 500 }
        );
    }
}