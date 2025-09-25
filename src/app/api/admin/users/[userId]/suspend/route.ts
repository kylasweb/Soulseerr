import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = params;
        const body = await request.json();
        const { reason } = body;

        // Update user status to suspended - removed invalid suspensionReason
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                status: 'SUSPENDED'
            }
        });

        // Log the action (you could add an audit log table)
        console.log(`User ${userId} suspended by admin ${(currentUser as any).id}`, {
            reason,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'User suspended successfully',
            user: {
                id: updatedUser.id,
                status: updatedUser.status
            }
        });

    } catch (error) {
        console.error('Error suspending user:', error);
        return NextResponse.json(
            { error: 'Failed to suspend user' },
            { status: 500 }
        );
    }
}