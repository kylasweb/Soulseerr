import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

// Virtual gift definitions
const VIRTUAL_GIFTS = {
    heart: { name: 'Heart', value: 10, emoji: '❤️' },
    star: { name: 'Star', value: 25, emoji: '⭐' },
    sparkles: { name: 'Sparkles', value: 50, emoji: '✨' },
    flower: { name: 'Mystic Rose', value: 75, emoji: '🌹' },
    coffee: { name: 'Energy Boost', value: 100, emoji: '☕' },
    gem: { name: 'Crystal', value: 200, emoji: '💎' },
    crown: { name: 'Crown', value: 500, emoji: '👑' },
    diamond: { name: 'Diamond', value: 1000, emoji: '💍' }
};

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { giftId, recipientId, quantity = 1, message } = body;

        if (!giftId || !recipientId) {
            return NextResponse.json(
                { success: false, error: 'Gift ID and recipient ID are required' },
                { status: 400 }
            );
        }

        // Validate gift
        const gift = VIRTUAL_GIFTS[giftId as keyof typeof VIRTUAL_GIFTS];
        if (!gift) {
            return NextResponse.json(
                { success: false, error: 'Invalid gift' },
                { status: 400 }
            );
        }

        const totalCost = gift.value * quantity;

        // Verify recipient exists
        const recipient = await db.user.findUnique({
            where: { id: recipientId },
            select: { id: true, name: true, profileImageUrl: true }
        });

        if (!recipient) {
            return NextResponse.json(
                { success: false, error: 'Recipient not found' },
                { status: 404 }
            );
        }

        // Check sender's balance and perform transaction
        const result = await db.$transaction(async (tx) => {
            // Get current balance
            const sender = await tx.user.findUnique({
                where: { id: user.userId },
                select: { coinBalance: true }
            });

            if (!sender || sender.coinBalance < totalCost) {
                throw new Error('Insufficient balance');
            }

            // Deduct coins from sender
            await tx.user.update({
                where: { id: user.userId },
                data: {
                    coinBalance: {
                        decrement: totalCost
                    }
                }
            });

            // Add earnings to recipient (readers get a percentage)
            const recipientUser = await tx.user.findUnique({
                where: { id: recipientId },
                select: { role: true }
            });

            // if (recipientUser?.role === 'reader') {
            const earningsPercentage = 0.7; // 70% goes to the reader
            const earnings = Math.floor(totalCost * earningsPercentage);

            await tx.user.update({
                where: { id: recipientId },
                data: {
                    coinBalance: {
                        increment: earnings
                    }
                }
            });
            // }

            // Create gift record
            const virtualGift = await tx.virtualGift.create({
                data: {
                    giftType: giftId,
                    senderId: user.userId,
                    receiverId: recipientId,
                    quantity,
                    totalValue: totalCost,
                    message: message || null
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profileImageUrl: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            profileImageUrl: true
                        }
                    }
                }
            });

            return virtualGift;
        });

        const formattedGift = {
            id: result.id,
            gift: {
                id: giftId,
                name: gift.name,
                emoji: gift.emoji,
                value: gift.value
            },
            sender: result.sender,
            recipient: result.receiver,
            quantity: result.quantity,
            totalValue: result.totalValue,
            message: result.message,
            timestamp: result.createdAt
        };

        return NextResponse.json({
            success: true,
            gift: formattedGift
        });

    } catch (error) {
        console.error('Send virtual gift API error:', error);

        if (error instanceof Error && error.message === 'Insufficient balance') {
            return NextResponse.json(
                { success: false, error: 'Insufficient coin balance' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to send gift' },
            { status: 500 }
        );
    }
}