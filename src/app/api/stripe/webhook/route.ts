import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const verificationResult = StripeService.verifyWebhookSignature(
      body,
      signature,
      webhookSecret
    );

    if (!verificationResult.success) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the webhook event
    const result = await StripeService.handleWebhookEvent(verificationResult.event!);

    if (!result.success) {
      console.error('Error handling webhook event:', result.error);
      return NextResponse.json(
        { error: 'Failed to handle webhook event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
