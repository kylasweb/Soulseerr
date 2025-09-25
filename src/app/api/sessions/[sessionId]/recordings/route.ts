import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Get recordings for this session
        const recordings = await db.sessionRecording.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                recordingUrl: true,
                thumbnailUrl: true,
                duration: true,
                fileSize: true,
                format: true,
                status: true,
                startedAt: true,
                completedAt: true,
                isEncrypted: true,
                downloadCount: true,
                createdAt: true
            }
        });

        const formattedRecordings = recordings.map(recording => ({
            id: recording.id,
            sessionId,
            recordingUrl: recording.recordingUrl,
            thumbnailUrl: recording.thumbnailUrl,
            duration: recording.duration || 0,
            size: recording.fileSize || 0,
            format: recording.format,
            status: recording.status,
            startedAt: recording.startedAt,
            completedAt: recording.completedAt,
            isEncrypted: recording.isEncrypted,
            downloadCount: recording.downloadCount,
            createdAt: recording.createdAt
        }));

        return NextResponse.json({
            success: true,
            recordings: formattedRecordings
        });

    } catch (error) {
        console.error('Fetch recordings error:', error);
        return NextResponse.json({
            error: 'Failed to fetch recordings'
        }, { status: 500 });
    }
}