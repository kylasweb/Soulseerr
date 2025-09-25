import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

const updateAvailabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
    isRecurring: z.boolean().optional(),
    specificDate: z.string().datetime().nullable().optional(),
})

// GET /api/availability/[availabilityId] - Get specific availability slot
export async function GET(request: NextRequest, { params }: { params: Promise<{ availabilityId: string }> }) {
    try {
        const { availabilityId } = await params

        const availability = await db.availability.findUnique({
            where: { id: availabilityId },
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
            }
        })

        if (!availability) {
            return NextResponse.json(
                { error: 'Availability slot not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ availability })

    } catch (error) {
        console.error('Get availability error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT /api/availability/[availabilityId] - Update availability slot (Reader only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ availabilityId: string }> }) {
    return withRole(['READER'])(async (req: AuthenticatedRequest) => {
        try {
            const { availabilityId } = await params // Make params available in closure
            const body = await req.json()
            const validatedData = updateAvailabilitySchema.parse(body)
            const userId = req.user!.userId

            // Check if availability exists and belongs to the reader
            const existingAvailability = await db.availability.findUnique({
                where: { id: availabilityId }
            })

            if (!existingAvailability) {
                return NextResponse.json(
                    { error: 'Availability slot not found' },
                    { status: 404 }
                )
            }

            if (existingAvailability.readerId !== userId) {
                return NextResponse.json(
                    { error: 'You can only update your own availability' },
                    { status: 403 }
                )
            }

            // Validate time range if both times are provided
            const startTime = validatedData.startTime || existingAvailability.startTime
            const endTime = validatedData.endTime || existingAvailability.endTime

            if (startTime >= endTime) {
                return NextResponse.json(
                    { error: 'Start time must be before end time' },
                    { status: 400 }
                )
            }

            // Check for conflicts with other availability slots (excluding current one)
            const dayOfWeek = validatedData.dayOfWeek !== undefined ? validatedData.dayOfWeek : existingAvailability.dayOfWeek

            const conflictingAvailability = await db.availability.findFirst({
                where: {
                    readerId: userId,
                    dayOfWeek,
                    id: { not: availabilityId }, // Exclude current availability slot
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: startTime } },
                                { endTime: { gt: startTime } }
                            ]
                        },
                        {
                            AND: [
                                { startTime: { lt: endTime } },
                                { endTime: { gte: endTime } }
                            ]
                        },
                        {
                            AND: [
                                { startTime: { gte: startTime } },
                                { endTime: { lte: endTime } }
                            ]
                        }
                    ]
                }
            })

            if (conflictingAvailability) {
                return NextResponse.json(
                    { error: 'This time slot conflicts with existing availability' },
                    { status: 409 }
                )
            }

            const updateData: any = { ...validatedData }
            if (validatedData.specificDate !== undefined) {
                updateData.specificDate = validatedData.specificDate ? new Date(validatedData.specificDate) : null
            }

            const availability = await db.availability.update({
                where: { id: availabilityId },
                data: updateData,
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
                }
            })

            return NextResponse.json({
                message: 'Availability updated successfully',
                availability
            })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Update availability error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// DELETE /api/availability/[availabilityId] - Delete availability slot (Reader only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ availabilityId: string }> }) {
    return withRole(['READER'])(async (req: AuthenticatedRequest) => {
        try {
            const { availabilityId } = await params // Make params available in closure
            const userId = req.user!.userId

            // Check if availability exists and belongs to the reader
            const existingAvailability = await db.availability.findUnique({
                where: { id: availabilityId }
            })

            if (!existingAvailability) {
                return NextResponse.json(
                    { error: 'Availability slot not found' },
                    { status: 404 }
                )
            }

            if (existingAvailability.readerId !== userId) {
                return NextResponse.json(
                    { error: 'You can only delete your own availability' },
                    { status: 403 }
                )
            }

            await db.availability.delete({
                where: { id: availabilityId }
            })

            return NextResponse.json({
                message: 'Availability slot deleted successfully'
            })

        } catch (error) {
            console.error('Delete availability error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}