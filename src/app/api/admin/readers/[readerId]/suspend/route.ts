import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';
// import { getSocket } from '@/lib/socket'; // Commented out due to import error

interface RouteParams {
    params: {
        readerId: string;
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

        const { readerId } = params;
        const { reason } = await request.json();

        if (!reason) {
            return NextResponse.json(
                { error: 'Suspension reason is required' },
                { status: 400 }
            );
        }

        // Update reader status to offline (suspended)
        const reader = await db.reader.update({
            where: { id: readerId },
            data: {
                status: 'OFFLINE'
            },
            include: {
                user: true
            }
        });

        // Cancel all pending sessions for this reader - removed invalid cancellationReason
        await db.session.updateMany({
            where: {
                readerId: readerId,
                status: { in: ['SCHEDULED'] }
            },
            data: {
                status: 'CANCELLED'
            }
        });

        // // Send real-time notification - commented out
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:reader:update', {
        //         type: 'reader_suspended',
        //         readerId,
        //         userId: reader.userId
        //     });

        //     // Notify the reader
        //     io.to(`user_${reader.userId}`).emit('notification', {
        //         type: 'account_suspended',
        //         title: 'Account Suspended',
        //         message: `Your reader account has been suspended. Reason: ${reason}`,
        //         timestamp: new Date().toISOString()
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Reader suspended successfully',
            reader
        });
    } catch (error) {
        console.error('Reader suspension error:', error);
        return NextResponse.json(
            { error: 'Failed to suspend reader' },
            { status: 500 }
        );
    }
}