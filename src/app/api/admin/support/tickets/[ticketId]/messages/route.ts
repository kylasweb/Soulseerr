import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const ticketId = params.ticketId;

        // Get all messages for the ticket
        const messages = await prisma.supportMessage.findMany({
            where: { ticketId },
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
        });

        return NextResponse.json({
            messages: messages.map(message => ({
                ...message,
                attachments: message.attachments ? JSON.parse(message.attachments) : []
            }))
        });

    } catch (error) {
        console.error('Support messages fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support messages' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const ticketId = params.ticketId;
        const body = await request.json();

        const {
            content,
            authorId,
            isFromCustomer = false,
            attachments = []
        } = body;

        // Create the message
        const message = await prisma.supportMessage.create({
            data: {
                ticketId,
                content,
                authorId,
                isFromCustomer,
                attachments: JSON.stringify(attachments)
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        // Update ticket's first response time if this is the first agent response
        if (!isFromCustomer) {
            const ticket = await prisma.supportTicket.findUnique({
                where: { id: ticketId },
                select: { firstResponseAt: true }
            });

            if (ticket && !ticket.firstResponseAt) {
                await prisma.supportTicket.update({
                    where: { id: ticketId },
                    data: { firstResponseAt: new Date() }
                });
            }
        }

        // Update ticket's updated timestamp
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            message: {
                ...message,
                attachments: JSON.parse(message.attachments || '[]')
            }
        });

    } catch (error) {
        console.error('Support message creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create support message' },
            { status: 500 }
        );
    }
}