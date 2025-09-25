import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('recording') as File;
        const sessionId = formData.get('sessionId') as string;
        const duration = parseInt(formData.get('duration') as string) || 0;

        if (!file || !sessionId) {
            return NextResponse.json({
                error: 'Recording file and session ID are required'
            }, { status: 400 });
        }

        // Create recordings directory if it doesn't exist
        const recordingsDir = path.join(process.cwd(), 'uploads', 'recordings');
        await mkdir(recordingsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `session-${sessionId}-${timestamp}.webm`;
        const filepath = path.join(recordingsDir, filename);

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Save recording metadata to database
        const recording = await db.sessionRecording.create({
            data: {
                sessionId,
                startedAt: new Date(),
                duration,
                recordingUrl: `/recordings/${filename}`, // Store relative path
                status: 'COMPLETED'
            }
        });

        return NextResponse.json({
            success: true,
            recording: {
                id: recording.id,
                sessionId: recording.sessionId,
                duration: recording.duration,
                recordingUrl: recording.recordingUrl,
                status: recording.status,
                createdAt: recording.createdAt
            }
        });

    } catch (error) {
        console.error('Upload recording error:', error);
        return NextResponse.json({
            error: 'Failed to upload recording'
        }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false, // Disable body parsing, consume as stream
    },
};