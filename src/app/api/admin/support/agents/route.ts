import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Get all support agents with their user data and statistics
        const agents = await prisma.supportAgent.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        // Transform agent data
        const transformedAgents = agents.map(agent => ({
            id: agent.id,
            name: agent.user.name,
            email: agent.user.email,
            avatar: agent.user.avatar,
            status: agent.status,
            activeTickets: agent.activeTickets,
            completedTickets: agent.completedTickets,
            satisfaction: agent.satisfactionScore,
            responseTime: agent.avgResponseTime
        }));

        return NextResponse.json({
            agents: transformedAgents
        });

    } catch (error) {
        console.error('Support agents fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support agents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        // Check if user exists and is admin role
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'User must be admin to become support agent' },
                { status: 400 }
            );
        }

        // Check if agent already exists
        const existingAgent = await prisma.supportAgent.findUnique({
            where: { userId }
        });

        if (existingAgent) {
            return NextResponse.json(
                { error: 'User is already a support agent' },
                { status: 400 }
            );
        }

        // Create support agent
        const agent = await prisma.supportAgent.create({
            data: {
                userId,
                status: 'offline'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({
            agent: {
                id: agent.id,
                name: agent.user.name,
                email: agent.user.email,
                avatar: agent.user.avatar,
                status: agent.status,
                activeTickets: agent.activeTickets,
                completedTickets: agent.completedTickets,
                satisfaction: agent.satisfactionScore,
                responseTime: agent.avgResponseTime
            }
        });

    } catch (error) {
        console.error('Support agent creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create support agent' },
            { status: 500 }
        );
    }
}