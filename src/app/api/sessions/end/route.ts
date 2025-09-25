import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, duration } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Get the session
        const session = await db.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        if (session.status === 'COMPLETED') {
            return NextResponse.json({
                error: 'Session has already ended'
            }, { status: 400 });
        }

        const endTime = new Date();

        // Calculate actual duration if not provided
        let actualDuration = duration;
        if (!actualDuration && session.startedAt) {
            const startTime = new Date(session.startedAt);
            actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // in minutes
        }

        // Update the session
        const updatedSession = await db.session.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endedAt: endTime,
                duration: actualDuration
            }
        });

        // In a real implementation, you would also:
        // 1. Calculate final billing amount
        // 2. Process payment if not already done
        // 3. Send session completion notifications
        // 4. Generate session summary/transcript
        // 5. Update reader/client statistics

        return NextResponse.json({
            success: true,
            session: {
                id: updatedSession.id,
                status: updatedSession.status,
                startedAt: updatedSession.startedAt,
                endedAt: updatedSession.endedAt,
                duration: actualDuration
            },
            message: 'Session ended successfully'
        });

    } catch (error) {
        console.error('End session error:', error);
        return NextResponse.json({
            error: 'Failed to end session'
        }, { status: 500 });
    }
}