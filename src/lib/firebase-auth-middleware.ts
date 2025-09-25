import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminService } from './firebase-admin';

export interface FirebaseAuthContext {
    firebaseUser: any;
    isAuthenticated: boolean;
}

// Middleware to verify Firebase ID tokens
export function withFirebaseAuth<T extends any[]>(
    handler: (request: NextRequest, context: FirebaseAuthContext, ...args: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
        try {
            // Get the authorization header
            const authHeader = request.headers.get('authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { error: 'Firebase ID token required. Please include Authorization: Bearer <token> header.' },
                    { status: 401 }
                );
            }

            const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

            // Verify the Firebase ID token using Admin SDK
            const verificationResult = await FirebaseAdminService.verifyIdToken(idToken);

            if (!verificationResult.success) {
                return NextResponse.json(
                    { error: 'Invalid Firebase token', details: verificationResult.error },
                    { status: 401 }
                );
            }

            const context: FirebaseAuthContext = {
                firebaseUser: verificationResult.user,
                isAuthenticated: true,
            };

            return handler(request, context, ...args);
        } catch (error) {
            console.error('Firebase auth middleware error:', error);
            return NextResponse.json(
                { error: 'Firebase authentication failed' },
                { status: 401 }
            );
        }
    };
}

// Optional Firebase auth - doesn't fail if no token provided
export function withOptionalFirebaseAuth<T extends any[]>(
    handler: (request: NextRequest, context: FirebaseAuthContext, ...args: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
        try {
            // Get the authorization header
            const authHeader = request.headers.get('authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // No token provided - continue without authentication
                const context: FirebaseAuthContext = {
                    firebaseUser: null,
                    isAuthenticated: false,
                };
                return handler(request, context, ...args);
            }

            const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

            // Verify the Firebase ID token using Admin SDK
            const verificationResult = await FirebaseAdminService.verifyIdToken(idToken);

            if (!verificationResult.success) {
                // Invalid token - continue without authentication
                const context: FirebaseAuthContext = {
                    firebaseUser: null,
                    isAuthenticated: false,
                };
                return handler(request, context, ...args);
            }

            const context: FirebaseAuthContext = {
                firebaseUser: verificationResult.user,
                isAuthenticated: true,
            };

            return handler(request, context, ...args);
        } catch (error) {
            console.error('Optional Firebase auth middleware error:', error);
            // Continue without authentication on error
            const context: FirebaseAuthContext = {
                firebaseUser: null,
                isAuthenticated: false,
            };
            return handler(request, context, ...args);
        }
    };
}

// Utility to extract Firebase user info from request
export async function getFirebaseUserFromRequest(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const idToken = authHeader.substring(7);
        const verificationResult = await FirebaseAdminService.verifyIdToken(idToken);

        return verificationResult.success ? verificationResult.user : null;
    } catch (error) {
        console.error('Get Firebase user from request error:', error);
        return null;
    }
}