import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth-service';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return null;
    }

    const verification = await AuthService.verifyToken(token);
    if (!verification.valid || !verification.user) {
      return null;
    }

    // Map AuthUser to JWTPayload format
    return {
      userId: verification.user.id,
      email: verification.user.email,
      role: verification.user.role,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Get user role from database using Prisma
    const { db } = await import('./db');
    const userData = await db.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    return userData?.role || null;
  } catch (error) {
    console.error('Get current user role error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(requiredRole: string): Promise<JWTPayload> {
  const user = await requireAuth();
  const role = await getCurrentUserRole();

  if (role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }

  return user;
}

export async function createServerAuthContext() {
  const user = await getCurrentUser();
  const role = await getCurrentUserRole();

  return {
    user,
    role,
    isAuthenticated: !!user,
  };
}

// Higher-order function to wrap API routes with authentication
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, context: { user: JWTPayload }, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      return handler(request, { user }, ...args);
    } catch (error) {
      console.error('withAuth error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

// Higher-order function to wrap API routes with role-based authentication
export function withRole(requiredRole: string) {
  return function <T extends any[]>(
    handler: (request: NextRequest, context: { user: JWTPayload }, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      try {
        const user = await getCurrentUser();
        const role = await getCurrentUserRole();

        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        if (role !== requiredRole) {
          return NextResponse.json(
            { error: `Access denied. Required role: ${requiredRole}` },
            { status: 403 }
          );
        }

        return handler(request, { user }, ...args);
      } catch (error) {
        console.error('withRole error:', error);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    };
  };
}