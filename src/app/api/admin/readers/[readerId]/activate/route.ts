import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';
// import { getSocket } from '@/lib/socket'; // Commented out due to import error
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

interface RouteParams {
    params: {
        readerId: string;
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

        const { readerId } = params;

        // Update reader status to active
        const reader = await db.reader.update({
            where: { id: readerId },
            data: {
                status: 'ONLINE'
            }
        });

        // TODO: Send real-time notification (socket functionality commented out)
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:reader:update', {
        //         type: 'reader_activated',
        //         readerId,
        //         userId: reader.userId
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Reader activated successfully',
            reader
        });
    } catch (error) {
        console.error('Reader activation error:', error);
        return NextResponse.json(
            { error: 'Failed to activate reader' },
            { status: 500 }
        );
    }
}