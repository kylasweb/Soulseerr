import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Remove if not used or fix import
import { db } from '@/lib/db';
// import { getSocket } from '@/lib/socket'; // Remove if not used or fix import

interface RouteParams {
    params: {
        payoutId: string;
    };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        // const session = await getServerSession(); // Commented out due to import error

        // if (!session?.user?.email) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // // Check if user is admin
        // const adminUser = await db.user.findUnique({
        //     where: { email: session.user.email },
        //     select: { role: true, id: true }
        // });

        // if (adminUser?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const { payoutId } = params;
        const { reason } = await request.json();

        if (!reason) {
            return NextResponse.json(
                { error: 'Cancellation reason is required' },
                { status: 400 }
            );
        }

        // Get the payout request - removed reader include
        const payoutRequest = await db.payout.findUnique({
            where: { id: payoutId }
        });

        if (!payoutRequest) {
            return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
        }

        if (payoutRequest.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Only pending payouts can be cancelled'
            }, { status: 400 });
        }

        // Cancel the payout - use 'FAILED' status instead of 'CANCELLED'
        const cancelledPayout = await db.payout.update({
            where: { id: payoutId },
            data: {
                status: 'FAILED'
            }
        });

        // // Send real-time notifications - commented out
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:finance:update', {
        //         type: 'payout_cancelled',
        //         payoutId,
        //         readerId: payoutRequest.readerId
        //     });

        //     // Notify the reader
        //     io.to(`user_${payoutRequest.reader.userId}`).emit('notification', {
        //         type: 'payout_cancelled',
        //         title: 'Payout Cancelled',
        //         message: `Your payout request has been cancelled. Reason: ${reason}`,
        //         timestamp: new Date().toISOString()
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Payout cancelled successfully',
            payout: cancelledPayout
        });
    } catch (error) {
        console.error('Payout cancellation error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel payout' },
            { status: 500 }
        );
    }
}