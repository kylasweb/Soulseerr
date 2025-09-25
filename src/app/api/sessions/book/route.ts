import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            readerId,
            duration,
            selectedDateTime,
            notes
        } = body;

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Check if the selected time slot is still available
        const existingBooking = await db.sessionBooking.findFirst({
            where: {
                readerId,
                selectedDateTime: new Date(selectedDateTime),
                status: {
                    notIn: ['CANCELLED_CLIENT', 'CANCELLED_READER', 'COMPLETED']
                }
            }
        });

        if (existingBooking) {
            return NextResponse.json({
                error: 'Time slot is no longer available'
            }, { status: 409 });
        }

        // Create the session booking
        const booking = await db.sessionBooking.create({
            data: {
                clientId: user.userId,
                readerId,
                preferredDates: [selectedDateTime], // Store as array in JSON
                selectedDateTime: new Date(selectedDateTime),
                duration,
                sessionType: 'VIDEO', // Default to video, could be made configurable
                status: 'PENDING',
                estimatedCost: calculateSessionCost(duration, readerId),
                notes: notes || null
            },
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

        // In a real implementation, you would:
        // 1. Send confirmation emails
        // 2. Create calendar events
        // 3. Process payment
        // 4. Send push notifications

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                sessionType: booking.sessionType,
                selectedDateTime: booking.selectedDateTime,
                duration: booking.duration,
                status: booking.status,
                estimatedCost: booking.estimatedCost,
                reader: booking.reader
            }
        });

    } catch (error) {
        console.error('Session booking error:', error);
        return NextResponse.json({
            error: 'Failed to book session'
        }, { status: 500 });
    }
}

// Helper function to calculate session cost
function calculateSessionCost(duration: number, readerId: string): number {
    // This would typically fetch the reader's hourly rate from the database
    // For demo purposes, using a fixed rate
    const hourlyRate = 100; // $100/hour
    return (hourlyRate / 60) * duration;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const whereClause: any = {
            OR: [
                { clientId: userId },
                { readerId: userId }
            ]
        };
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        const bookings = await db.sessionBooking.findMany({
            where: whereClause,
            include: {
                reader: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true
                    }
                },
                client: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true
                    }
                }
            },
            orderBy: {
                selectedDateTime: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            bookings: bookings.map(booking => ({
                id: booking.id,
                sessionType: booking.sessionType,
                selectedDateTime: booking.selectedDateTime,
                duration: booking.duration,
                status: booking.status,
                estimatedCost: booking.estimatedCost,
                reader: booking.reader,
                client: booking.client,
                requirements: booking.requirements,
                category: booking.category,
                priority: booking.priority,
                createdAt: booking.createdAt
            }))
        });

    } catch (error) {
        console.error('Fetch bookings error:', error);
        return NextResponse.json({
            error: 'Failed to fetch bookings'
        }, { status: 500 });
    }
}