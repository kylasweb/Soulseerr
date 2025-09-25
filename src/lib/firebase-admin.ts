import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Use environment variables for service account
const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
    // Skip initialization during build time or when required env vars are missing
    if (process.env.NODE_ENV === 'production' && (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail)) {
        console.warn('Firebase Admin SDK not initialized: Missing required environment variables');
        return null;
    }

    if (getApps().length === 0) {
        try {
            const app = initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.projectId,
            }, 'admin');

            console.log('Firebase Admin SDK initialized successfully');
            return app;
        } catch (error) {
            console.error('Firebase Admin SDK initialization failed:', error);
            // Don't throw during build time
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
            return null;
        }
    }
    return getApps()[0];
};

// Initialize the admin app
const adminApp = initializeFirebaseAdmin();

// Export admin services (with null checks)
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminFirestore = adminApp ? getFirestore(adminApp) : null;

// Admin utilities
export class FirebaseAdminService {
    /**
     * Verify a Firebase ID token
     */
    static async verifyIdToken(idToken: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            return {
                success: true,
                user: decodedToken,
            };
        } catch (error) {
            console.error('Token verification failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Token verification failed',
            };
        }
    }

    /**
     * Create a custom token for a user
     */
    static async createCustomToken(uid: string, additionalClaims?: object) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const customToken = await adminAuth.createCustomToken(uid, additionalClaims);
            return {
                success: true,
                token: customToken,
            };
        } catch (error) {
            console.error('Custom token creation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Custom token creation failed',
            };
        }
    }

    /**
     * Get user by UID
     */
    static async getUserByUid(uid: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const userRecord = await adminAuth.getUser(uid);
            return {
                success: true,
                user: userRecord,
            };
        } catch (error) {
            console.error('Get user failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user',
            };
        }
    }

    /**
     * Get user by email
     */
    static async getUserByEmail(email: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const userRecord = await adminAuth.getUserByEmail(email);
            return {
                success: true,
                user: userRecord,
            };
        } catch (error) {
            console.error('Get user by email failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user by email',
            };
        }
    }

    /**
     * Update user profile
     */
    static async updateUser(uid: string, properties: {
        email?: string;
        displayName?: string;
        photoURL?: string;
        disabled?: boolean;
    }) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const userRecord = await adminAuth.updateUser(uid, properties);
            return {
                success: true,
                user: userRecord,
            };
        } catch (error) {
            console.error('Update user failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update user',
            };
        }
    }

    /**
     * Delete a user
     */
    static async deleteUser(uid: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            await adminAuth.deleteUser(uid);
            return {
                success: true,
            };
        } catch (error) {
            console.error('Delete user failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete user',
            };
        }
    }

    /**
     * Set custom user claims (for role-based access)
     */
    static async setCustomClaims(uid: string, customClaims: object) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            await adminAuth.setCustomUserClaims(uid, customClaims);
            return {
                success: true,
            };
        } catch (error) {
            console.error('Set custom claims failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to set custom claims',
            };
        }
    }

    /**
     * List all users (with pagination)
     */
    static async listUsers(maxResults: number = 1000, pageToken?: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const listUsersResult = await adminAuth.listUsers(maxResults, pageToken);
            return {
                success: true,
                users: listUsersResult.users,
                pageToken: listUsersResult.pageToken,
            };
        } catch (error) {
            console.error('List users failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list users',
            };
        }
    }

    /**
     * Generate email verification link
     */
    static async generateEmailVerificationLink(email: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const link = await adminAuth.generateEmailVerificationLink(email);
            return {
                success: true,
                link,
            };
        } catch (error) {
            console.error('Generate email verification link failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate email verification link',
            };
        }
    }

    /**
     * Generate password reset link
     */
    static async generatePasswordResetLink(email: string) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const link = await adminAuth.generatePasswordResetLink(email);
            return {
                success: true,
                link,
            };
        } catch (error) {
            console.error('Generate password reset link failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate password reset link',
            };
        }
    }

    /**
     * Batch get users
     */
    static async getUsers(identifiers: Array<{ uid: string } | { email: string }>) {
        if (!adminAuth) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const getUsersResult = await adminAuth.getUsers(identifiers);
            return {
                success: true,
                users: getUsersResult.users,
                notFound: getUsersResult.notFound,
            };
        } catch (error) {
            console.error('Batch get users failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get users',
            };
        }
    }

    /**
     * Firestore operations
     */
    static async createDocument(collection: string, docId: string, data: any) {
        if (!adminFirestore) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            await adminFirestore.collection(collection).doc(docId).set(data);
            return {
                success: true,
            };
        } catch (error) {
            console.error('Create document failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create document',
            };
        }
    }

    static async getDocument(collection: string, docId: string) {
        if (!adminFirestore) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            const doc = await adminFirestore.collection(collection).doc(docId).get();
            return {
                success: true,
                exists: doc.exists,
                data: doc.data(),
            };
        } catch (error) {
            console.error('Get document failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get document',
            };
        }
    }

    static async updateDocument(collection: string, docId: string, data: any) {
        if (!adminFirestore) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            await adminFirestore.collection(collection).doc(docId).update(data);
            return {
                success: true,
            };
        } catch (error) {
            console.error('Update document failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update document',
            };
        }
    }

    static async deleteDocument(collection: string, docId: string) {
        if (!adminFirestore) {
            return {
                success: false,
                error: 'Firebase Admin not initialized',
            };
        }

        try {
            await adminFirestore.collection(collection).doc(docId).delete();
            return {
                success: true,
            };
        } catch (error) {
            console.error('Delete document failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete document',
            };
        }
    }
}

export default FirebaseAdminService;