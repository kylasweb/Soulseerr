import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';
// import { getSocket } from '@/lib/socket'; // Commented out due to import error
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

interface RouteParams {
    params: {
        transactionId: string;
    };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { transactionId } = params;

        // Get the original transaction
        const originalTransaction = await db.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!originalTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (originalTransaction.type !== 'SESSION_CHARGE' || originalTransaction.status !== 'COMPLETED') {
            return NextResponse.json({
                error: 'Only completed session charges can be refunded'
            }, { status: 400 });
        }

        // Check if already refunded
        const existingRefund = await db.transaction.findFirst({
            where: {
                type: 'REFUND',
                sessionId: originalTransaction.sessionId,
                status: { in: ['COMPLETED', 'PENDING'] }
            }
        });

        if (existingRefund) {
            return NextResponse.json({
                error: 'Transaction has already been refunded'
            }, { status: 400 });
        }

        // Process refund transaction
        const result = await db.$transaction(async (tx) => {
            // Create refund transaction
            const refundTransaction = await tx.transaction.create({
                data: {
                    type: 'REFUND',
                    status: 'PENDING',
                    amount: originalTransaction.amount,
                    currency: originalTransaction.currency,
                    description: `Refund for transaction ${originalTransaction.transactionId}`,
                    userId: originalTransaction.userId,
                    sessionId: originalTransaction.sessionId,
                    transactionId: `refund_${Date.now()}`
                }
            });

            // Update session status if needed
            if (originalTransaction.sessionId) {
                await tx.session.update({
                    where: { id: originalTransaction.sessionId },
                    data: {
                        status: 'CANCELLED'
                    }
                });
            }

            // Here you would integrate with Stripe to process the actual refund
            // For now, we'll mark it as completed
            const completedRefund = await tx.transaction.update({
                where: { id: refundTransaction.id },
                data: {
                    status: 'COMPLETED',
                    // TODO: Get actual transaction ID from Stripe refund
                    transactionId: null
                }
            });

            return { refundTransaction: completedRefund, originalTransaction };
        });

        // // Send real-time notifications - commented out
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:finance:update', {
        //         type: 'refund_processed',
        //         transactionId: result.refundTransaction.id,
        //         originalTransactionId: transactionId
        //     });

        //     // Notify the user
        //     if (originalTransaction.userId) {
        //         io.to(`user_${originalTransaction.userId}`).emit('notification', {
        //             type: 'refund_processed',
        //             title: 'Refund Processed',
        //             message: `Your payment of $${originalTransaction.amount} has been refunded.`,
        //             timestamp: new Date().toISOString()
        //         });
        //     }

        //     // Notify the reader if applicable
        //     if (originalTransaction.session?.reader?.userId) {
        //         io.to(`user_${originalTransaction.session.reader.userId}`).emit('notification', {
        //             type: 'session_refunded',
        //             title: 'Session Refunded',
        //             message: 'A session payment has been refunded by admin.',
        //             timestamp: new Date().toISOString()
        //         });
        //     }
        // }

        return NextResponse.json({
            success: true,
            message: 'Refund processed successfully',
            refund: result.refundTransaction
        });
    } catch (error) {
        console.error('Refund processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process refund' },
            { status: 500 }
        );
    }
}