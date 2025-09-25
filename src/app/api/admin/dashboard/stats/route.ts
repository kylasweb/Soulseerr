import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || 'today';

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Get session statistics
        const [
            totalSessions,
            activeSessions,
            completedSessions,
            cancelledSessions,
            revenueData,
            ratingsData,
            userCounts
        ] = await Promise.all([
            // Total sessions
            db.sessionBooking.count({
                where: {
                    createdAt: { gte: startDate }
                }
            }),

            // Active sessions (confirmed but not completed)
            db.sessionBooking.count({
                where: {
                    status: 'CONFIRMED',
                    createdAt: { gte: startDate }
                }
            }),

            // Completed sessions
            db.sessionBooking.count({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: startDate }
                }
            }),

            // Cancelled sessions
            db.sessionBooking.count({
                where: {
                    OR: [
                        { status: 'CANCELLED_CLIENT' },
                        { status: 'CANCELLED_READER' }
                    ],
                    createdAt: { gte: startDate }
                }
            }),

            // Revenue data
            db.sessionBooking.aggregate({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: startDate }
                },
                _sum: {
                    finalCost: true
                }
            }),

            // Average rating
            db.review.aggregate({
                where: {
                    createdAt: { gte: startDate }
                },
                _avg: {
                    rating: true
                }
            }),

            // User counts
            Promise.all([
                db.user.count({
                    where: {
                        role: 'READER',
                        createdAt: range === 'all' ? undefined : { gte: startDate }
                    }
                }),
                db.user.count({
                    where: {
                        role: 'CLIENT',
                        createdAt: range === 'all' ? undefined : { gte: startDate }
                    }
                })
            ])
        ]);

        const stats = {
            totalSessions,
            activeSessions,
            completedSessions,
            cancelledSessions,
            totalRevenue: revenueData._sum.finalCost || 0,
            averageRating: ratingsData._avg.rating || 0,
            totalReaders: userCounts[0],
            totalClients: userCounts[1]
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}