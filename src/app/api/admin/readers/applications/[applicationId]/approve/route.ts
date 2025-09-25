import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
// import { getSocket } from '@/lib/socket'; // Commented out - socket functionality not implemented

interface RouteParams {
    params: {
        applicationId: string;
    };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { applicationId } = params;

        // For now, create a basic reader profile since we don't have a reader application system implemented
        // This would need to be updated when the application model is implemented
        const readerProfile = await db.reader.create({
            data: {
                userId: applicationId, // Using applicationId as temporary userId
                firstName: 'New',
                lastName: 'Reader',
                bio: 'Approved reader - please update your profile',
                specialties: [],
                experience: 0,
                certifications: [],
                languages: ['en'],
                sessionTypes: ['chat'],
                pricing: { chat: 50 },
                status: 'ONLINE',
                isVerified: true,
                verificationDocs: [],
                totalSessions: 0,
                totalEarnings: 0,
                averageRating: 0
            }
        });

        // TODO: Send notification when notification system is implemented
        // const io = getSocket();
        // if (io) {
        //     io.emit('admin:reader:update', {
        //         type: 'application_approved',
        //         readerId: readerProfile.id,
        //         userId: readerProfile.userId
        //     });
        // }

        return NextResponse.json({
            success: true,
            message: 'Reader profile created successfully',
            readerProfile
        });
    } catch (error) {
        console.error('Application approval error:', error);
        return NextResponse.json(
            { error: 'Failed to approve application' },
            { status: 500 }
        );
    }
}