import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminService } from '@/lib/firebase-admin';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth-server';

const prisma = new PrismaClient();

// GET /api/admin/firebase/users - List Firebase users
export const GET = withAuth(async (request: NextRequest, { user }: any) => {
    try {
        // Only allow admin access
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const maxResults = parseInt(searchParams.get('limit') || '100');
        const pageToken = searchParams.get('pageToken') || undefined;

        const result = await FirebaseAdminService.listUsers(maxResults, pageToken);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            users: result.users,
            pageToken: result.pageToken,
            hasMore: !!result.pageToken
        });

    } catch (error) {
        console.error('Firebase admin users list error:', error);
        return NextResponse.json(
            { error: 'Failed to list users' },
            { status: 500 }
        );
    }
});

// POST /api/admin/firebase/users - Create or update user
export const POST = withAuth(async (request: NextRequest, { user }: any) => {
    try {
        // Only allow admin access
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { action, uid, email, displayName, photoURL, disabled, customClaims } = await request.json();

        switch (action) {
            case 'update':
                if (!uid) {
                    return NextResponse.json(
                        { error: 'UID is required for update' },
                        { status: 400 }
                    );
                }

                const updateResult = await FirebaseAdminService.updateUser(uid, {
                    email,
                    displayName,
                    photoURL,
                    disabled
                });

                if (!updateResult.success) {
                    return NextResponse.json(
                        { error: updateResult.error },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    message: 'User updated successfully',
                    user: updateResult.user
                });

            case 'setCustomClaims':
                if (!uid || !customClaims) {
                    return NextResponse.json(
                        { error: 'UID and custom claims are required' },
                        { status: 400 }
                    );
                }

                const claimsResult = await FirebaseAdminService.setCustomClaims(uid, customClaims);

                if (!claimsResult.success) {
                    return NextResponse.json(
                        { error: claimsResult.error },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    message: 'Custom claims set successfully'
                });

            case 'generateCustomToken':
                if (!uid) {
                    return NextResponse.json(
                        { error: 'UID is required for custom token' },
                        { status: 400 }
                    );
                }

                const tokenResult = await FirebaseAdminService.createCustomToken(uid, customClaims);

                if (!tokenResult.success) {
                    return NextResponse.json(
                        { error: tokenResult.error },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    customToken: tokenResult.token
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Firebase admin user operation error:', error);
        return NextResponse.json(
            { error: 'Failed to perform user operation' },
            { status: 500 }
        );
    }
});

// DELETE /api/admin/firebase/users - Delete user
export const DELETE = withAuth(async (request: NextRequest, { user }: any) => {
    try {
        // Only allow admin access
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            );
        }

        // Delete from Firebase
        const deleteResult = await FirebaseAdminService.deleteUser(uid);

        if (!deleteResult.success) {
            return NextResponse.json(
                { error: deleteResult.error },
                { status: 500 }
            );
        }

        // Also delete from our database
        try {
            await prisma.user.deleteMany({
                where: { firebaseUid: uid }
            });
        } catch (dbError) {
            console.error('Database deletion failed:', dbError);
            // Firebase deletion succeeded, but database deletion failed
            // This is not critical as the user is removed from Firebase
        }

        return NextResponse.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Firebase admin user deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
});