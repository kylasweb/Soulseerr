import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/lib/db'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = loginSchema.parse(body)

        // Find user with profile data
        const user = await db.user.findUnique({
            where: { email },
            include: {
                clientProfile: true,
                readerProfile: true,
                adminProfile: true,
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Check password
        if (!user.passwordHash) {
            return NextResponse.json(
                { error: 'Password not set. Please use social login or reset your password.' },
                { status: 401 }
            )
        }

        const isValidPassword = await compare(password, user.passwordHash)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Check if user account is active
        if (user.status !== 'ACTIVE') {
            let message = 'Account is not active'
            if (user.status === 'PENDING') {
                message = 'Please verify your email address'
            } else if (user.status === 'SUSPENDED') {
                message = 'Account is suspended'
            } else if (user.status === 'BANNED') {
                message = 'Account is banned'
            }

            return NextResponse.json({ error: message }, { status: 403 })
        }

        // Generate JWT token
        const token = sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        )

        // Return user data without password
        const { passwordHash: _, ...userWithoutPassword } = user

        // Create response with HTTP-only cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        })

        // Set secure HTTP-only cookie
        response.cookies.set({
            name: 'auth-token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        })

        return response

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
