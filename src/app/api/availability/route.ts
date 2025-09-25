import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

const createAvailabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    isRecurring: z.boolean().default(true),
    specificDate: z.string().datetime().optional(),
})

const updateAvailabilitySchema = createAvailabilitySchema.partial()

const getAvailabilitySchema = z.object({
    readerId: z.string().optional(),
    dayOfWeek: z.coerce.number().min(0).max(6).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
})

// POST /api/availability - Create availability slot (Reader only)
export const POST = withRole(['READER'])(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json()
        const validatedData = createAvailabilitySchema.parse(body)
        const userId = req.user!.userId

        // Validate time range
        if (validatedData.startTime >= validatedData.endTime) {
            return NextResponse.json(
                { error: 'Start time must be before end time' },
                { status: 400 }
            )
        }

        // Check for conflicts with existing availability
        const existingAvailability = await db.availability.findFirst({
            where: {
                readerId: userId,
                dayOfWeek: validatedData.dayOfWeek,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: validatedData.startTime } },
                            { endTime: { gt: validatedData.startTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: validatedData.endTime } },
                            { endTime: { gte: validatedData.endTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { gte: validatedData.startTime } },
                            { endTime: { lte: validatedData.endTime } }
                        ]
                    }
                ]
            }
        })

        if (existingAvailability) {
            return NextResponse.json(
                { error: 'This time slot conflicts with existing availability' },
                { status: 409 }
            )
        }

        const availability = await db.availability.create({
            data: {
                readerId: userId,
                ...validatedData,
                specificDate: validatedData.specificDate ? new Date(validatedData.specificDate) : null,
            }
        })

        return NextResponse.json({
            message: 'Availability created successfully',
            availability
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Create availability error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

// GET /api/availability - Get availability slots
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const validatedParams = getAvailabilitySchema.parse({
            readerId: searchParams.get('readerId'),
            dayOfWeek: searchParams.get('dayOfWeek'),
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
        })

        let whereClause: any = {}

        if (validatedParams.readerId) {
            whereClause.readerId = validatedParams.readerId
        }

        if (validatedParams.dayOfWeek !== undefined) {
            whereClause.dayOfWeek = validatedParams.dayOfWeek
        }

        // If date range is specified, include specific dates within range
        if (validatedParams.startDate || validatedParams.endDate) {
            whereClause.OR = [
                { isRecurring: true }, // Always include recurring availability
                {
                    AND: [
                        { specificDate: { not: null } },
                        validatedParams.startDate && { specificDate: { gte: new Date(validatedParams.startDate) } },
                        validatedParams.endDate && { specificDate: { lte: new Date(validatedParams.endDate) } }
                    ].filter(Boolean)
                }
            ]
        }

        const availability = await db.availability.findMany({
            where: whereClause,
            include: {
                reader: {
                    select: {
                        id: true,
                        username: true,
                        readerProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        })

        return NextResponse.json({ availability })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Get availability error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
