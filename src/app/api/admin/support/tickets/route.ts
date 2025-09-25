import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        const assignedTo = searchParams.get('assignedTo');

        const skip = (page - 1) * limit;

        // Build where conditions
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (priority && priority !== 'all') {
            where.priority = priority;
        }

        if (assignedTo && assignedTo !== 'all') {
            where.assignedToId = assignedTo;
        }

        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { ticketNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Get tickets with customer and assigned agent data
        const tickets = await prisma.supportTicket.findMany({
            where,
            skip,
            take: limit,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Get total count for pagination
        const total = await prisma.supportTicket.count({ where });

        // Transform the data
        const transformedTickets = tickets.map(ticket => ({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            customer: {
                ...ticket.customer,
                tier: 'free' // Default tier since we don't have subscription info yet
            },
            assignedTo: ticket.assignedTo,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            firstResponseAt: ticket.firstResponseAt,
            resolvedAt: ticket.resolvedAt,
            tags: ticket.tags ? JSON.parse(ticket.tags) : [],
            satisfactionRating: ticket.satisfactionRating,
            resolutionTime: ticket.resolutionTime,
            messageCount: ticket._count.messages,
            lastMessage: ticket.messages[0] || null
        }));

        return NextResponse.json({
            tickets: transformedTickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Support tickets fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            subject,
            description,
            priority = 'medium',
            category,
            customerId,
            assignedToId,
            tags = []
        } = body;

        // Generate ticket number
        const timestamp = Date.now().toString().slice(-6);
        const ticketNumber = `TK-${new Date().getFullYear()}-${timestamp}`;

        // Create the ticket
        const ticket = await prisma.supportTicket.create({
            data: {
                ticketNumber,
                subject,
                description,
                priority,
                category,
                customerId,
                assignedToId,
                tags: JSON.stringify(tags),
                status: 'open'
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // Create initial message from customer
        await prisma.supportMessage.create({
            data: {
                ticketId: ticket.id,
                content: description,
                isFromCustomer: true,
                authorId: customerId
            }
        });

        return NextResponse.json({
            ticket: {
                ...ticket,
                customer: {
                    ...ticket.customer,
                    tier: 'free' // Default tier
                },
                tags: JSON.parse(ticket.tags || '[]')
            }
        });

    } catch (error) {
        console.error('Support ticket creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create support ticket' },
            { status: 500 }
        );
    }
}