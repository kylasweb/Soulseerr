import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, sessionId, userId } = await request.json();

    if (!amount || !currency || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify session exists and belongs to user
    const session = await db.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.clientId !== userId) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Create payment intent
    const result = await StripeService.createPaymentIntent({
      amount,
      currency,
      sessionId,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update session with payment intent ID (if your schema supports this)
    // await db.session.update({
    //   where: { id: sessionId },
    //   data: { stripePaymentIntentId: result.paymentIntentId },
    // });

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
