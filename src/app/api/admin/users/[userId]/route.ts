import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = params;

        // Check if user exists and get their role
        const userToDelete = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true }
        });

        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent deleting other admins (optional security measure)
        if (userToDelete.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Cannot delete admin users' },
                { status: 403 }
            );
        }

        // Delete user (cascade will handle related records)
        await db.user.delete({
            where: { id: userId }
        });

        // Log the action
        console.log(`User ${userId} (${userToDelete.email}) deleted by admin ${(currentUser as any).id}`, {
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = params;

        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                clientProfile: true,
                readerProfile: true,
                clientSessions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        type: true
                    }
                },
                readerSessions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        type: true
                    }
                },
                clientReviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true
                    }
                },
                readerReviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        clientSessions: true,
                        readerSessions: true,
                        clientReviews: true,
                        readerReviews: true,
                        notifications: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = params;
        const body = await request.json();
        const { status, role, name, email, phone } = body;

        const updateData: any = {};

        if (status) updateData.status = status;
        if (role) updateData.role = role;
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: updateData
        });

        // Log the action
        console.log(`User ${userId} updated by admin ${(currentUser as any).id}`, {
            changes: updateData,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}