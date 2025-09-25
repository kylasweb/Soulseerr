'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChange, 
  signOut as firebaseSignOut,
  FirebaseUser 
} from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'reader' | 'client';
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook' | 'twitter' | 'github';
  firebaseUid?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'reader' | 'client', name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  syncFirebaseUser: (firebaseUser: FirebaseUser) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Sync Firebase user with our backend user system
  const syncFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      // Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Sync user with our database using the ID token for verification
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync user');
      }

      const userData = await response.json();
      return userData.user;
    } catch (error) {
      console.error('Error syncing Firebase user:', error);
      throw error;
    }
  };

  // Traditional email/password sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Sign in failed');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Store auth token
      localStorage.setItem('auth-token', data.token);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Traditional email/password sign up
  const signUp = async (
    email: string, 
    password: string, 
    role: 'reader' | 'client',
    name: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role, name }),
      });

      if (!response.ok) {
        throw new Error('Sign up failed');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Store auth token
      localStorage.setItem('auth-token', data.token);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out from both Firebase and our system
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Sign out from Firebase if user is signed in
      if (firebaseUser) {
        await firebaseSignOut();
      }
      
      // Sign out from our backend
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      // Clear local state
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('auth-token');
      
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear local state even if API call fails
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('auth-token');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    // Check for existing auth token
    const checkAuthToken = async () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('auth-token');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('auth-token');
        }
      }
      setLoading(false);
    };

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Sync Firebase user with our backend
          const syncedUser = await syncFirebaseUser(firebaseUser);
          setUser(syncedUser);
          
          // Get the auth token for API calls
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('auth-token', token);
        } catch (error) {
          console.error('Firebase user sync error:', error);
          // If sync fails, sign out from Firebase
          await firebaseSignOut();
        }
      } else if (!localStorage.getItem('auth-token')) {
        // Only clear user if no traditional auth token exists
        setUser(null);
      }
      
      if (!loading) return; // Prevent duplicate loading states
      setLoading(false);
    });

    // Check traditional auth token if no Firebase user
    if (!firebaseUser) {
      checkAuthToken();
    }

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    syncFirebaseUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};