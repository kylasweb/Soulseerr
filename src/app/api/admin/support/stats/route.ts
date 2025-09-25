import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get support statistics
        const totalTickets = await prisma.supportTicket.count();

        const openTickets = await prisma.supportTicket.count({
            where: { status: { in: ['open', 'in-progress', 'waiting-response'] } }
        });

        const resolvedToday = await prisma.supportTicket.count({
            where: {
                status: 'resolved',
                updatedAt: { gte: todayStart }
            }
        });

        // Calculate average response time (in hours)
        const ticketsWithResponse = await prisma.supportTicket.findMany({
            where: {
                firstResponseAt: { not: null }
            },
            select: {
                createdAt: true,
                firstResponseAt: true
            }
        });

        const avgResponseTime = ticketsWithResponse.length > 0
            ? ticketsWithResponse.reduce((sum, ticket) => {
                const responseTime = (ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
                return sum + responseTime;
            }, 0) / ticketsWithResponse.length
            : 0;

        // Calculate average resolution time (in hours)
        const resolvedTickets = await prisma.supportTicket.findMany({
            where: {
                status: 'resolved',
                resolvedAt: { not: null }
            },
            select: {
                createdAt: true,
                resolvedAt: true
            }
        });

        const avgResolutionTime = resolvedTickets.length > 0
            ? resolvedTickets.reduce((sum, ticket) => {
                const resolutionTime = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
                return sum + resolutionTime;
            }, 0) / resolvedTickets.length
            : 0;

        // Calculate satisfaction score
        const satisfactionRatings = await prisma.supportTicket.findMany({
            where: { satisfactionRating: { not: null } },
            select: { satisfactionRating: true }
        });

        const satisfactionScore = satisfactionRatings.length > 0
            ? satisfactionRatings.reduce((sum, ticket) => sum + ticket.satisfactionRating!, 0) / satisfactionRatings.length
            : 0;

        // Get ticket trends (last 7 days)
        const ticketTrends: Array<{ period: string; tickets: number; resolved: number }> = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const created = await prisma.supportTicket.count({
                where: {
                    createdAt: {
                        gte: dayStart,
                        lt: dayEnd
                    }
                }
            });

            const resolved = await prisma.supportTicket.count({
                where: {
                    status: 'resolved',
                    resolvedAt: {
                        gte: dayStart,
                        lt: dayEnd
                    }
                }
            });

            ticketTrends.push({
                period: date.toLocaleDateString('en-US', { weekday: 'short' }),
                tickets: created,
                resolved
            });
        }

        // Get category breakdown
        const categoryBreakdown = await prisma.supportTicket.groupBy({
            by: ['category'],
            _count: {
                category: true
            }
        });

        const categoryData = categoryBreakdown.map(item => ({
            category: item.category || 'Other',
            count: item._count.category,
            percentage: Math.round((item._count.category / totalTickets) * 100)
        }));

        return NextResponse.json({
            totalTickets,
            openTickets,
            resolvedToday,
            avgResponseTime: Math.round(avgResponseTime * 10) / 10,
            avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
            satisfactionScore: Math.round(satisfactionScore * 10) / 10,
            ticketTrends,
            categoryBreakdown: categoryData
        });

    } catch (error) {
        console.error('Support stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support statistics' },
            { status: 500 }
        );
    }
}