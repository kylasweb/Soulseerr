import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: recordingId } = await params;

        if (!recordingId) {
            return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
        }

        // Get recording from database
        const recording = await db.sessionRecording.findUnique({
            where: { id: recordingId },
            select: {
                id: true,
                recordingUrl: true,
                thumbnailUrl: true
            }
        });

        if (!recording) {
            return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
        }

        // Note: In a real implementation, you would delete the file from cloud storage
        // For now, we just delete the database record
        // if (recording.recordingUrl) {
        //     // Delete from cloud storage (AWS S3, etc.)
        // }
        // if (recording.thumbnailUrl) {
        //     // Delete thumbnail from cloud storage
        // }

        // Delete record from database
        await db.sessionRecording.delete({
            where: { id: recordingId }
        });

        return NextResponse.json({
            success: true,
            message: 'Recording deleted successfully'
        });

    } catch (error) {
        console.error('Delete recording error:', error);
        return NextResponse.json({
            error: 'Failed to delete recording'
        }, { status: 500 });
    }
}