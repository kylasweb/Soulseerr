import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/readers - Get all active readers
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const specialties = url.searchParams.get('specialties')?.split(',')
        const minRating = parseFloat(url.searchParams.get('minRating') || '0')
        const maxRate = parseFloat(url.searchParams.get('maxRate') || '1000')
        const isOnline = url.searchParams.get('isOnline') === 'true'
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        let whereClause: any = {
            status: 'ONLINE'
        }

        // Build filter conditions
        if (specialties && specialties.length > 0) {
            whereClause.specialties = {
                hasSome: specialties
            }
        }

        if (minRating > 0) {
            whereClause.averageRating = {
                gte: minRating
            }
        }

        // Remove maxRate filter as hourlyRate is not in Reader model
        // Price is stored in pricing JSON field

        // Remove isOnline filter as it's not in the Reader model

        const readers = await db.reader.findMany({
            where: whereClause,
            include: {
                user: true,
            },
            orderBy: [
                { averageRating: 'desc' },
                { totalSessions: 'desc' }
            ],
            take: limit,
            skip: offset,
        })

        const totalCount = await db.reader.count({ where: whereClause })

        // Remove sensitive data
        const sanitizedReaders = readers.map(reader => ({
            id: reader.id,
            userId: reader.userId,
            bio: reader.bio,
            specialties: reader.specialties,
            rating: reader.averageRating,
            totalSessions: reader.totalSessions,
            isActive: reader.status === 'ONLINE',
            createdAt: reader.createdAt,
            updatedAt: reader.updatedAt,
            user: {
                name: reader.user.name,
                email: reader.user.email,
                username: reader.user.username
            }
        }))

        return NextResponse.json({
            readers: sanitizedReaders,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        })

    } catch (error) {
        console.error('Get readers error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET /api/readers/[readerId] - Get specific reader details
export async function getReader(request: NextRequest, readerId: string) {
    try {
        const reader = await db.reader.findFirst({
            where: {
                id: readerId,
                status: 'ONLINE',
            },
            include: {
                user: true
            }
        })

        if (!reader) {
            return NextResponse.json(
                { error: 'Reader not found' },
                { status: 404 }
            )
        }

        const safeReader = {
            id: reader.id,
            userId: reader.userId,
            bio: reader.bio,
            specialties: reader.specialties,
            rating: reader.averageRating,
            totalSessions: reader.totalSessions,
            isActive: reader.status === 'ONLINE',
            createdAt: reader.createdAt,
            updatedAt: reader.updatedAt,
            user: {
                name: reader.user.name,
                email: reader.user.email,
                username: reader.user.username
            }
        }

        return NextResponse.json({ reader: safeReader })

    } catch (error) {
        console.error('Get reader error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
