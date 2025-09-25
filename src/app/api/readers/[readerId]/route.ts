import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/readers/[readerId] - Get specific reader details
export async function GET(request: NextRequest, { params }: { params: Promise<{ readerId: string }> }) {
    try {
        const { readerId } = await params

        const reader = await db.user.findFirst({
            where: {
                id: readerId,
                role: 'READER',
                status: 'ACTIVE',
            },
            include: {
                readerProfile: true,
                readerReviews: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                clientProfile: {
                                    select: {
                                        firstName: true,
                                        avatar: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                availability: {
                    where: {
                        startTime: {
                            gte: new Date().toTimeString().slice(0, 5) // Current time in HH:mm format
                        }
                    },
                    orderBy: { startTime: 'asc' },
                    take: 20,
                }
            }
        })

        if (!reader || !reader.readerProfile) {
            return NextResponse.json(
                { error: 'Reader not found or not available' },
                { status: 404 }
            )
        }

        const { passwordHash, ...safeReader } = reader

        return NextResponse.json({ reader: safeReader })

    } catch (error) {
        console.error('Get reader error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}