import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const readerId = searchParams.get('readerId');
        const dateTime = searchParams.get('dateTime');

        if (!readerId || !dateTime) {
            return NextResponse.json({
                error: 'readerId and dateTime are required'
            }, { status: 400 });
        }

        const requestedDateTime = new Date(dateTime);
        if (isNaN(requestedDateTime.getTime())) {
            return NextResponse.json({
                error: 'Invalid dateTime format'
            }, { status: 400 });
        }

        // Check if reader exists and is active
        const reader = await db.reader.findFirst({
            where: {
                userId: readerId,
                status: {
                    in: ['ONLINE', 'BUSY', 'AWAY']
                }
            }
        });

        if (!reader) {
            return NextResponse.json({
                error: 'Reader not found or inactive'
            }, { status: 404 });
        }

        // Check for existing bookings at this time
        const existingBooking = await db.sessionBooking.findFirst({
            where: {
                readerId: reader.userId,
                selectedDateTime: requestedDateTime,
                status: {
                    notIn: ['CANCELLED_CLIENT', 'CANCELLED_READER', 'COMPLETED']
                }
            }
        });

        if (existingBooking) {
            return NextResponse.json({
                available: false,
                reason: 'Time slot already booked'
            });
        }

        // For now, return available - we'll add availability logic later
        return NextResponse.json({
            available: true,
            readerId: reader.userId,
            dateTime: requestedDateTime.toISOString()
        });

    } catch (error) {
        console.error('Availability check error:', error);
        return NextResponse.json({
            error: 'Failed to check availability'
        }, { status: 500 });
    }
}
