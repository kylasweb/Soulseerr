import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate user statistics
        const [
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersThisWeek,
            clientCount,
            readerCount,
            adminCount,
            suspendedCount
        ] = await Promise.all([
            // Total users
            db.user.count(),

            // Active users
            db.user.count({
                where: { status: 'ACTIVE' }
            }),

            // New users today
            db.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),

            // New users this week
            db.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),

            // Client count
            db.user.count({
                where: { role: 'CLIENT' }
            }),

            // Reader count
            db.user.count({
                where: { role: 'READER' }
            }),

            // Admin count
            db.user.count({
                where: { role: 'ADMIN' }
            }),

            // Suspended count
            db.user.count({
                where: { status: 'SUSPENDED' }
            })
        ]);

        const stats = {
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersThisWeek,
            clientCount,
            readerCount,
            adminCount,
            suspendedCount
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user statistics' },
            { status: 500 }
        );
    }
}