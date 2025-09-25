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

        // Get content statistics
        const totalItems = await db.contentItem.count();

        const publishedItems = await db.contentItem.count({
            where: { status: 'PUBLISHED' }
        });

        const draftItems = await db.contentItem.count({
            where: { status: 'DRAFT' }
        });

        const archivedItems = await db.contentItem.count({
            where: { status: 'ARCHIVED' }
        });

        // Get total views (sum of all content item views)
        const viewsResult = await db.contentItem.aggregate({
            _sum: {
                views: true
            }
        });

        const totalViews = viewsResult._sum.views || 0;

        // Get popular content (items with high view counts)
        const popularContent = await db.contentItem.count({
            where: {
                views: {
                    gte: 100 // Consider items with 100+ views as popular
                }
            }
        });

        // Get recent updates (items updated in the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUpdates = await db.contentItem.count({
            where: {
                updatedAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        const stats = {
            totalItems,
            publishedItems,
            draftItems,
            archivedItems,
            totalViews,
            popularContent,
            recentUpdates
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Content stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content statistics' },
            { status: 500 }
        );
    }
}