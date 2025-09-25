'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface UseStripeOptions {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export const useStripe = (options: UseStripeOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (data: {
    amount: number;
    currency: string;
    sessionId: string;
    userId: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      return {
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (clientSecret: string, cardElement: any): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        options.onSuccess?.(paymentIntent.id);
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      } else {
        throw new Error('Payment not successful');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const createConnectAccount = async (data: {
    userId: string;
    email: string;
    country: string;
    type?: 'express' | 'custom';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create Connect account');
      }

      return {
        success: true,
        accountId: result.accountId,
        account: result.account,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const createAccountLink = async (data: {
    accountId: string;
    returnUrl: string;
    refreshUrl: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create account link');
      }

      return {
        success: true,
        url: result.url,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPaymentIntent,
    confirmPayment,
    createConnectAccount,
    createAccountLink,
    clearError: () => setError(null),
  };
};