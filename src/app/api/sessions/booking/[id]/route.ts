import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params;

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const booking = await db.sessionBooking.findUnique({
            where: { id: bookingId },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true
                    }
                },
                reader: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Format the response
        const formattedBooking = {
            id: booking.id,
            selectedDateTime: booking.selectedDateTime,
            duration: booking.duration,
            status: booking.status,
            estimatedCost: booking.estimatedCost,
            reader: {
                userId: booking.reader.id,
                name: booking.reader.name || booking.reader.displayName || 'Anonymous Reader',
                email: booking.reader.email
            },
            client: {
                userId: booking.client.id,
                name: booking.client.name || booking.client.displayName || 'Anonymous Client',
                email: booking.client.email
            }
        };

        return NextResponse.json({
            success: true,
            booking: formattedBooking
        });

    } catch (error) {
        console.error('Fetch booking error:', error);
        return NextResponse.json({
            error: 'Failed to fetch booking details'
        }, { status: 500 });
    }
}