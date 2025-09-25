import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        // Authenticate and authorize
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = await getCurrentUserRole();
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // TODO: Implement device tracking from user agent strings, analytics, etc.
        const deviceData = [];

        // You would typically get this data from your database like this:
        // const deviceData = await db.session.groupBy({
        //   by: ['deviceType'],
        //   _count: {
        //     userId: true
        //   },
        //   orderBy: {
        //     _count: {
        //       userId: 'desc'
        //     }
        //   }
        // });

        return NextResponse.json({ deviceData });

    } catch (error) {
        console.error('Device data error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch device data' },
            { status: 500 }
        );
    }
}