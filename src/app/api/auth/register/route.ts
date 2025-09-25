import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).optional(),
    role: z.enum(['CLIENT', 'READER']).default('CLIENT'),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username || undefined }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await hash(validatedData.password, 12)

        // Create user
        const user = await db.user.create({
            data: {
                email: validatedData.email,
                username: validatedData.username,
                passwordHash,
                role: validatedData.role,
                status: 'PENDING', // Email verification required
            }
        })

        // Create profile based on role
        if (validatedData.role === 'CLIENT') {
            await db.client.create({
                data: {
                    userId: user.id,
                    firstName: validatedData.firstName || '',
                    lastName: validatedData.lastName || '',
                    preferences: {},
                    preferredSessionTypes: [],
                    preferredCategories: [],
                }
            })
        } else if (validatedData.role === 'READER') {
            await db.reader.create({
                data: {
                    userId: user.id,
                    firstName: validatedData.firstName || '',
                    lastName: validatedData.lastName || '',
                    bio: '',
                    status: 'OFFLINE',
                    specialties: [],
                    sessionTypes: [],
                    experience: 0,
                    certifications: [],
                    languages: [],
                    pricing: {},
                    verificationDocs: {},
                }
            })
        }

        // Create wallet for user
        await db.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
            }
        })

        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user

        return NextResponse.json({
            message: 'User registered successfully. Please check your email for verification.',
            user: userWithoutPassword
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
