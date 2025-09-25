'use client';

import { useState, useEffect } from 'react';
import { useStripe } from '@/hooks/use-stripe';
import { CardElement, useStripe as useStripeElement, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  sessionId: string;
  userId: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentForm({
  sessionId,
  userId,
  amount,
  currency = 'usd',
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const stripe = useStripeElement();
  const elements = useElements();
  const { createPaymentIntent, confirmPayment, loading, error } = useStripe({
    onSuccess: (paymentIntentId) => {
      setPaymentStatus('success');
      onSuccess?.(paymentIntentId);
    },
    onError: (error) => {
      setPaymentStatus('error');
      setPaymentError(error);
      onError?.(error);
    },
  });

  // Create payment intent on component mount
  useEffect(() => {
    const initializePayment = async () => {
      const result = await createPaymentIntent({
        amount,
        currency,
        sessionId,
        userId,
      });

      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        setPaymentStatus('error');
        setPaymentError(result.error || 'Failed to initialize payment');
      }
    };

    initializePayment();
  }, [amount, currency, sessionId, userId, createPaymentIntent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready');
      return;
    }

    setPaymentStatus('processing');
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found');
      setPaymentStatus('error');
      return;
    }

    const result = await confirmPayment(clientSecret, cardElement);
    
    if (!result.success) {
      setPaymentError(result.error || 'Payment failed');
      setPaymentStatus('error');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-lg font-semibold">{formatAmount(amount)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">Session ID:</span>
            <Badge variant="outline" className="text-xs">
              {sessionId}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {(error || paymentError) && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error || paymentError}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {paymentStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your session has been booked.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        {paymentStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Element */}
            <div>
              <Label htmlFor="card-element">Card Details</Label>
              <div className="mt-1">
                <CardElement
                  id="card-element"
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                  className="p-3 border rounded-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!stripe || loading || paymentStatus === 'processing'}
              className="w-full"
              size="lg"
            >
              {loading || paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay {formatAmount(amount)}
                </>
              )}
            </Button>
          </form>
        )}

        {/* Processing State */}
        {paymentStatus === 'processing' && (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Processing your payment...</p>
          </div>
        )}

        {/* Security Note */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Your payment information is encrypted and secure.</p>
          <p>We use Stripe to process payments securely.</p>
        </div>
      </CardContent>
    </Card>
  );
}