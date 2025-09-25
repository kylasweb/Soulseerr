import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Get the session
        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: { client: true, reader: true }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        if (session.status !== 'SCHEDULED') {
            return NextResponse.json({
                error: 'Session must be scheduled to start'
            }, { status: 400 });
        }

        // Update the session to in progress
        const updatedSession = await db.session.update({
            where: { id: sessionId },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            session: {
                id: updatedSession.id,
                status: updatedSession.status,
                startedAt: updatedSession.startedAt
            }
        });

    } catch (error) {
        console.error('Start session error:', error);
        return NextResponse.json({
            error: 'Failed to start session'
        }, { status: 500 });
    }
}