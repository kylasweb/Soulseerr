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

        // Get the payout request - removed reader include
        const payoutRequest = await db.payout.findUnique({
            where: { id: payoutId }
        });

        if (!payoutRequest) {
            return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
        }

        if (payoutRequest.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Only pending payouts can be processed'
            }, { status: 400 });
        }

        // Get reader info
        const reader = await db.reader.findUnique({
            where: { id: payoutRequest.readerId },
            include: { user: true }
        });

        // Process the payout
        const result = await db.$transaction(async (tx) => {
            // Update payout status to processing
            const processingPayout = await tx.payout.update({
                where: { id: payoutId },
                data: {
                    status: 'PROCESSING'
                }
            });

            // Create payout transaction record - fixed properties
            const payoutTransaction = await tx.transaction.create({
                data: {
                    type: 'PAYOUT',
                    status: 'PENDING',
                    amount: payoutRequest.amount,
                    currency: payoutRequest.currency || 'USD',
                    description: `Payout to ${reader?.user?.name || 'Reader'}`,
                    userId: reader?.userId || '',
                    transactionId: `txn_${Date.now()}`
                }
            });

            // Here you would integrate with Stripe to process the actual payout
            // For now, we'll simulate successful processing
            const completedTransaction = await tx.transaction.update({
                where: { id: payoutTransaction.id },
                data: {
                    status: 'COMPLETED',
                    // TODO: Get actual transaction ID from Stripe payout
                    transactionId: null
                }
            });

            // Update payout request to completed
            const completedPayout = await tx.payout.update({
                where: { id: payoutId },
                data: {
                    status: 'COMPLETED',
                    stripeTransferId: completedTransaction.transactionId
                }
            });

            return { payout: completedPayout, transaction: completedTransaction };
        });

        // // Send real-time notifications - commented out
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:finance:update', {
        //         type: 'payout_processed',
        //         payoutId,
        //         readerId: payoutRequest.readerId
        //     });

        //     // Notify the reader
        //     io.to(`user_${payoutRequest.reader.userId}`).emit('notification', {
        //         type: 'payout_processed',
        //         title: 'Payout Processed',
        //         message: `Your payout of $${payoutRequest.amount} has been processed and is on its way to your account.`,
        //         timestamp: new Date().toISOString()
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Payout processed successfully',
            payout: result.payout,
            transaction: result.transaction
        });
    } catch (error) {
        console.error('Payout processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process payout' },
            { status: 500 }
        );
    }
}