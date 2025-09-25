import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build the query - show gifts sent by user or received by user
        const whereClause: any = {
            OR: [
                { senderId: user.userId },
                { receiverId: user.userId }
            ]
        };

        // If userId is specified and user is admin, show gifts for that specific user
        if (userId && user.role === 'admin') {
            whereClause.OR = [
                { senderId: userId },
                { receiverId: userId }
            ];
        }

        const gifts = await db.virtualGift.findMany({
            where: whereClause,
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
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        // Virtual gift definitions for formatting
        const VIRTUAL_GIFTS: any = {
            heart: { name: 'Heart', emoji: '❤️' },
            star: { name: 'Star', emoji: '⭐' },
            sparkles: { name: 'Sparkles', emoji: '✨' },
            flower: { name: 'Mystic Rose', emoji: '🌹' },
            coffee: { name: 'Energy Boost', emoji: '☕' },
            gem: { name: 'Crystal', emoji: '💎' },
            crown: { name: 'Crown', emoji: '👑' },
            diamond: { name: 'Diamond', emoji: '💍' }
        };

        const formattedGifts = gifts.map(gift => ({
            id: gift.id,
            gift: {
                id: gift.giftType,
                name: VIRTUAL_GIFTS[gift.giftType]?.name || gift.giftType,
                emoji: VIRTUAL_GIFTS[gift.giftType]?.emoji || '🎁'
            },
            sender: {
                id: gift.sender.id,
                name: gift.sender.name,
                avatar: gift.sender.profileImageUrl
            },
            recipient: {
                id: gift.receiver.id,
                name: gift.receiver.name,
                avatar: gift.receiver.profileImageUrl
            },
            quantity: gift.quantity,
            totalValue: gift.totalValue,
            message: gift.message,
            timestamp: gift.createdAt
        }));

        return NextResponse.json({
            success: true,
            transactions: formattedGifts
        });

    } catch (error) {
        console.error('Virtual gifts history API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch gift history' },
            { status: 500 }
        );
    }
}