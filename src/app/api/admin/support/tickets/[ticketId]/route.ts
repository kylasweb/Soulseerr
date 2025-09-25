import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const ticketId = params.ticketId;

        // Get ticket with full details
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
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
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ticket: {
                ...ticket,
                customer: {
                    ...ticket.customer,
                    tier: 'free' // Default tier
                },
                tags: ticket.tags ? JSON.parse(ticket.tags) : []
            }
        });

    } catch (error) {
        console.error('Support ticket fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support ticket' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const ticketId = params.ticketId;
        const body = await request.json();

        const {
            subject,
            status,
            priority,
            category,
            assignedToId,
            tags,
            satisfactionRating
        } = body;

        // Prepare update data
        const updateData: any = {};

        if (subject !== undefined) updateData.subject = subject;
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'resolved') {
                updateData.resolvedAt = new Date();
            } else if (status === 'closed') {
                updateData.closedAt = new Date();
            }
        }
        if (priority !== undefined) updateData.priority = priority;
        if (category !== undefined) updateData.category = category;
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (satisfactionRating !== undefined) updateData.satisfactionRating = satisfactionRating;

        // Update the ticket
        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: updateData,
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

        return NextResponse.json({
            ticket: {
                ...ticket,
                customer: {
                    ...ticket.customer,
                    tier: 'free' // Default tier
                },
                tags: ticket.tags ? JSON.parse(ticket.tags) : []
            }
        });

    } catch (error) {
        console.error('Support ticket update error:', error);
        return NextResponse.json(
            { error: 'Failed to update support ticket' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const ticketId = params.ticketId;

        // Delete the ticket (messages will cascade delete)
        await prisma.supportTicket.delete({
            where: { id: ticketId }
        });

        return NextResponse.json({
            message: 'Support ticket deleted successfully'
        });

    } catch (error) {
        console.error('Support ticket deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete support ticket' },
            { status: 500 }
        );
    }
}