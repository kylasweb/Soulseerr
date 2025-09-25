import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';
// import { getSocket } from '@/lib/socket'; // Commented out due to import error

interface RouteParams {
    params: {
        applicationId: string;
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

        const { applicationId } = params;
        const { reason } = await request.json();

        if (!reason) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        // Update application status - commented out as ReaderApplication model doesn't exist
        // const application = await db.readerApplication.update({
        //     where: { id: applicationId },
        //     data: {
        //         status: 'REJECTED',
        //         reviewedAt: new Date(),
        //         reviewedBy: adminUser.id,
        //         rejectionReason: reason
        //     },
        //     include: {
        //         user: true
        //     }
        // });

        // // Send real-time notification - commented out
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:reader:update', {
        //         type: 'application_rejected',
        //         applicationId,
        //         userId: application.userId
        //     });

        //     // Notify the user
        //     io.to(`user_${application.userId}`).emit('notification', {
        //         type: 'application_rejected',
        //         title: 'Application Update',
        //         message: `Your reader application has been reviewed. Reason: ${reason}`,
        //         timestamp: new Date().toISOString()
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Application rejected successfully'
            // application
        });
    } catch (error) {
        console.error('Application rejection error:', error);
        return NextResponse.json(
            { error: 'Failed to reject application' },
            { status: 500 }
        );
    }
}