'use client';

import { useState } from 'react';
import { useStripe } from '@/hooks/use-stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Loader2,
  User,
  Globe,
  Shield,
} from 'lucide-react';

interface ConnectAccountSetupProps {
  userId: string;
  email: string;
  onSuccess?: (accountId: string) => void;
  onError?: (error: string) => void;
}

export function ConnectAccountSetup({
  userId,
  email,
  onSuccess,
  onError,
}: ConnectAccountSetupProps) {
  const [country, setCountry] = useState('US');
  const [accountType, setAccountType] = useState<'express' | 'custom'>('express');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountLinkUrl, setAccountLinkUrl] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'creating' | 'linking' | 'success' | 'error'>('idle');
  const [setupError, setSetupError] = useState<string | null>(null);
  
  const { createConnectAccount, createAccountLink, loading, error } = useStripe({
    onSuccess: () => {
      // This will be called when operations succeed
    },
    onError: (error) => {
      setSetupStatus('error');
      setSetupError(error);
      onError?.(error);
    },
  });

  const handleCreateAccount = async () => {
    setSetupStatus('creating');
    setSetupError(null);

    const result = await createConnectAccount({
      userId,
      email,
      country,
      type: accountType,
    });

    if (result.success) {
      setAccountId(result.accountId);
      setSetupStatus('linking');
      
      // Create account link immediately
      const linkResult = await createAccountLink({
        accountId: result.accountId,
        returnUrl: `${window.location.origin}/dashboard?setup=complete`,
        refreshUrl: `${window.location.origin}/dashboard?setup=refresh`,
      });

      if (linkResult.success) {
        setAccountLinkUrl(linkResult.url);
      } else {
        setSetupError(linkResult.error || 'Failed to create account link');
        setSetupStatus('error');
      }
    } else {
      setSetupError(result.error || 'Failed to create Connect account');
      setSetupStatus('error');
    }
  };

  const handleCompleteSetup = () => {
    setSetupStatus('success');
    if (accountId) {
      onSuccess?.(accountId);
    }
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'IE', name: 'Ireland' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Stripe Connect Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User ID:</span>
            <Badge variant="outline" className="text-xs">
              {userId}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {(error || setupError) && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error || setupError}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {setupStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Stripe Connect account setup complete! You can now receive payments.
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Form */}
        {setupStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={accountType} onValueChange={(value: 'express' | 'custom') => setAccountType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="express">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Express (Recommended)
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Custom (Advanced)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Connect Account
                </>
              )}
            </Button>
          </div>
        )}

        {/* Account Link */}
        {setupStatus === 'linking' && accountLinkUrl && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Your Stripe Connect account has been created! Click the button below to complete your account setup and verification.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => window.open(accountLinkUrl, '_blank')}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Complete Account Setup
            </Button>

            <Button
              onClick={handleCompleteSetup}
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              I've Completed Setup
            </Button>
          </div>
        )}

        {/* Processing State */}
        {(setupStatus === 'creating' || setupStatus === 'linking') && (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {setupStatus === 'creating' ? 'Creating your Connect account...' : 'Generating setup link...'}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="font-semibold">With Stripe Connect you can:</h4>
          <ul className="space-y-1">
            <li>• Receive payments directly to your bank account</li>
            <li>• Manage payouts and transfers</li>
            <li>• View detailed transaction history</li>
            <li>• Access tax documents and reporting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}