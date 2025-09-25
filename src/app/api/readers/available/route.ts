import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const specialty = searchParams.get('specialty');
        const minRating = searchParams.get('minRating');
        const maxRate = searchParams.get('maxRate');
        const isOnlineNow = searchParams.get('isOnlineNow');

        // Build where clause based on filters
        const whereClause: any = {
            status: 'ONLINE'
        };

        if (specialty) {
            whereClause.specialties = {
                has: specialty
            };
        }

        if (minRating) {
            whereClause.averageRating = {
                gte: parseFloat(minRating)
            };
        }

        if (maxRate) {
            // Note: pricing is stored as JSON, this would need more complex filtering
            // For now, skip this filter
        }

        const readers = await db.reader.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true
                    }
                }
            },
            take: 50
        });

        // Format the response
        const formattedReaders = readers.map(reader => ({
            userId: reader.user.id,
            name: reader.user.name || reader.user.displayName || `${reader.firstName} ${reader.lastName}`.trim(),
            email: reader.user.email,
            avatar: reader.avatar,
            specialties: reader.specialties,
            rating: reader.averageRating,
            totalReadings: reader.totalSessions,
            hourlyRate: 50, // Default rate - would need to extract from pricing JSON
            bio: reader.bio,
            isOnlineNow: reader.status === 'ONLINE',
            responseTimeAvg: 30, // Default - would need actual data
            availability: [], // Would need availability data
            templates: [] // Would need template data
        }));

        return NextResponse.json({
            readers: formattedReaders
        });

    } catch (error) {
        console.error('Fetch readers error:', error);
        return NextResponse.json({
            error: 'Failed to fetch available readers'
        }, { status: 500 });
    }
}