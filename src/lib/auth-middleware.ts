import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string
        email: string
        role: string
    }
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
        try {
            // Get token from cookie or Authorization header
            const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

            if (!token) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                )
            }

            // Verify token
            const decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

            // Add user to request
            const authenticatedRequest = request as AuthenticatedRequest
            authenticatedRequest.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            }

            return await handler(authenticatedRequest)

        } catch (error) {
            console.error('Auth middleware error:', error)
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }
    }
}

export function withRole(roles: string[]) {
    return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
        return withAuth(async (request: AuthenticatedRequest) => {
            if (!request.user || !roles.includes(request.user.role)) {
                return NextResponse.json(
                    { error: 'Insufficient permissions' },
                    { status: 403 }
                )
            }
            return await handler(request)
        })
    }
}