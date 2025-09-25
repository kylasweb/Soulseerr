'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { 
  signInWithGoogle,
  signInWithFacebook, 
  signInWithTwitter,
  signInWithGithub 
} from '@/lib/firebase';
import Link from 'next/link';

interface SocialLoginFormProps {
  onSuccess?: () => void;
}

export const SocialLoginForm: React.FC<SocialLoginFormProps> = ({ onSuccess }) => {
  const { signIn, syncFirebaseUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(formData.email, formData.password);
      onSuccess?.();
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    setError(null);

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'twitter':
          result = await signInWithTwitter();
          break;
        case 'github':
          result = await signInWithGithub();
          break;
        default:
          throw new Error('Unknown provider');
      }

      if (result.user) {
        await syncFirebaseUser(result.user);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists. Please use your original sign-in method.');
      } else {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const SocialButton: React.FC<{ 
    provider: string; 
    icon: string; 
    label: string;
    bgColor: string;
    textColor?: string;
  }> = ({ provider, icon, label, bgColor, textColor = 'text-white' }) => (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${bgColor} ${textColor} border-0 hover:opacity-90 transition-opacity`}
      onClick={() => handleSocialSignIn(provider)}
      disabled={socialLoading !== null}
    >
      {socialLoading === provider ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      ) : (
        <span className="mr-2 text-lg">{icon}</span>
      )}
      {socialLoading === provider ? 'Signing in...' : `Continue with ${label}`}
    </Button>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Sign In to SoulSeer</CardTitle>
        <p className="text-gray-600">Access your spiritual reading platform</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Login Options */}
        <div className="space-y-3">
          <SocialButton
            provider="google"
            icon="🚀"
            label="Google"
            bgColor="bg-red-500"
          />
          <SocialButton
            provider="facebook"
            icon="📘"
            label="Facebook"
            bgColor="bg-blue-600"
          />
          <SocialButton
            provider="github"
            icon="🐱"
            label="GitHub"
            bgColor="bg-gray-800"
          />
          <SocialButton
            provider="twitter"
            icon="🐦"
            label="Twitter"
            bgColor="bg-blue-400"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || socialLoading !== null}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In with Email'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Sign up here
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <Link href="/auth/forgot-password" className="hover:underline">
            Forgot your password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};