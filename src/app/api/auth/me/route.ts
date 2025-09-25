import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    displayName: true,
                    role: true,
                    avatar: true,
                    provider: true,
                    firebaseUid: true,
                    emailVerified: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                user: {
                    ...user,
                    name: user.displayName || user.username || 'User'
                }
            });

        } catch (jwtError) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user information' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}