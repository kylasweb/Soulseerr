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

        // Update user status to active
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE'
            }
        });

        // Log the action
        console.log(`User ${userId} activated by admin ${(currentUser as any).id}`, {
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'User activated successfully',
            user: {
                id: updatedUser.id,
                status: updatedUser.status
            }
        });

    } catch (error) {
        console.error('Error activating user:', error);
        return NextResponse.json(
            { error: 'Failed to activate user' },
            { status: 500 }
        );
    }
}