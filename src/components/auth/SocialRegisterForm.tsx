'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { 
  signInWithGoogle,
  signInWithFacebook, 
  signInWithTwitter,
  signInWithGithub 
} from '@/lib/firebase';
import Link from 'next/link';

interface SocialRegisterFormProps {
  onSuccess?: () => void;
}

export const SocialRegisterForm: React.FC<SocialRegisterFormProps> = ({ onSuccess }) => {
  const { signUp, syncFirebaseUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: '' as 'reader' | 'client' | ''
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

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as 'reader' | 'client'
    });
    setError(null);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.role) {
      setError('Please select your role');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.role, formData.name);
      onSuccess?.();
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        setError('An account with this email already exists');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
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
        // For social sign-ups, user will be created as CLIENT by default
        // They can upgrade to READER later through the platform
        await syncFirebaseUser(result.user);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error(`${provider} sign up error:`, error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up was cancelled');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(`Failed to sign up with ${provider}. Please try again.`);
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
      onClick={() => handleSocialSignUp(provider)}
      disabled={socialLoading !== null}
    >
      {socialLoading === provider ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      ) : (
        <span className="mr-2 text-lg">{icon}</span>
      )}
      {socialLoading === provider ? 'Creating account...' : `Sign up with ${label}`}
    </Button>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join SoulSeer</CardTitle>
        <p className="text-gray-600">Create your spiritual reading account</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Sign Up Options */}
        <div className="space-y-3">
          <p className="text-sm text-center text-gray-600 mb-3">
            Quick sign up - choose your role later
          </p>
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
            <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

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
            <Label htmlFor="role">I want to be a:</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client - Seek spiritual guidance</SelectItem>
                <SelectItem value="reader">Reader - Provide spiritual readings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in here
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>By creating an account, you agree to our</p>
          <div>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            {' and '}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};