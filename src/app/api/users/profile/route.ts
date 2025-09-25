import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

// GET /api/users/profile - Get current user profile
export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const user = await db.user.findUnique({
            where: { id: request.user!.userId },
            include: {
                clientProfile: true,
                readerProfile: true,
                adminProfile: true,
                wallet: true,
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Remove password hash from response
        const { passwordHash: _, ...userWithoutPassword } = user

        return NextResponse.json({ user: userWithoutPassword })

    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

// PUT /api/users/profile - Update current user profile
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json()
        const userId = request.user!.userId

        // Get current user to determine role
        const currentUser = await db.user.findUnique({
            where: { id: userId },
            include: {
                clientProfile: true,
                readerProfile: true,
            }
        })

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Update user base data
        const updateData: any = {}
        if (body.username) updateData.username = body.username

        if (Object.keys(updateData).length > 0) {
            await db.user.update({
                where: { id: userId },
                data: updateData
            })
        }

        // Update profile based on role
        if (currentUser.role === 'CLIENT' && currentUser.clientProfile) {
            const profileData: any = {}
            if (body.firstName) profileData.firstName = body.firstName
            if (body.lastName) profileData.lastName = body.lastName
            if (body.avatar) profileData.avatar = body.avatar
            if (body.bio) profileData.bio = body.bio
            if (body.dateOfBirth) profileData.dateOfBirth = new Date(body.dateOfBirth)
            if (body.timezone) profileData.timezone = body.timezone

            if (Object.keys(profileData).length > 0) {
                await db.client.update({
                    where: { userId },
                    data: profileData
                })
            }
        } else if (currentUser.role === 'READER' && currentUser.readerProfile) {
            const profileData: any = {}
            if (body.firstName) profileData.firstName = body.firstName
            if (body.lastName) profileData.lastName = body.lastName
            if (body.avatar) profileData.avatar = body.avatar
            if (body.bio) profileData.bio = body.bio
            if (body.specialties) profileData.specialties = body.specialties
            if (body.experience) profileData.experience = body.experience
            if (body.hourlyRate) profileData.hourlyRate = body.hourlyRate

            if (Object.keys(profileData).length > 0) {
                await db.reader.update({
                    where: { userId },
                    data: profileData
                })
            }
        }

        // Get updated user data
        const updatedUser = await db.user.findUnique({
            where: { id: userId },
            include: {
                clientProfile: true,
                readerProfile: true,
                wallet: true,
            }
        })

        const { passwordHash: _, ...userWithoutPassword } = updatedUser!

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: userWithoutPassword
        })

    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})
