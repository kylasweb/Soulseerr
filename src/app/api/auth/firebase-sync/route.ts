import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { withFirebaseAuth } from '@/lib/firebase-auth-middleware';

const prisma = new PrismaClient();

export const POST = withFirebaseAuth(async (request: NextRequest, { firebaseUser }: any) => {
    try {
        const { uid: firebaseUid, email, name, picture: avatar, firebase } = firebaseUser;

        if (!firebaseUid || !email) {
            return NextResponse.json(
                { error: 'Firebase UID and email are required' },
                { status: 400 }
            );
        }

        // Extract provider information from Firebase token
        const provider = firebase.sign_in_provider || 'email';

        // Check if user already exists in our database
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid },
                    { email }
                ]
            }
        });

        if (user) {
            // Update existing user with Firebase data
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    firebaseUid,
                    displayName: name || user.displayName,
                    avatar: avatar || user.avatar,
                    provider: provider ? provider.toUpperCase() as any : user.provider,
                    emailVerified: firebaseUser.email_verified || true,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new user account
            // For social sign-ins, we'll default to 'CLIENT' role
            user = await prisma.user.create({
                data: {
                    firebaseUid,
                    email,
                    displayName: name || email.split('@')[0],
                    role: 'CLIENT', // Default role for social sign-ups
                    avatar,
                    provider: provider ? provider.toUpperCase() as any : 'EMAIL',
                    emailVerified: firebaseUser.email_verified || true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Create client profile for new users
            await prisma.client.create({
                data: {
                    userId: user.id,
                    firstName: name?.split(' ')[0] || 'User',
                    lastName: name?.split(' ').slice(1).join(' ') || '',
                    bio: 'Welcome to SoulSeer! Complete your profile to get started.',
                    preferences: {},
                    preferredSessionTypes: ["chat"],
                    preferredCategories: []
                }
            });
        }

        // Generate JWT token for our API
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                firebaseUid: user.firebaseUid
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '30d' }
        );

        // Return user data (excluding sensitive info)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.displayName || user.username || 'User',
            role: user.role,
            avatar: user.avatar,
            provider: user.provider,
            firebaseUid: user.firebaseUid,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            success: true,
            user: userData,
            token,
            message: user.createdAt === user.updatedAt ?
                'Account created successfully' :
                'Welcome back!'
        });

    } catch (error) {
        console.error('Firebase sync error:', error);

        // Handle specific Prisma errors
        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return NextResponse.json(
                    { error: 'An account with this email already exists' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to sync user account' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
});