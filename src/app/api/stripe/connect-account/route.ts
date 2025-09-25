import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, country, type } = await request.json();

    if (!userId || !email || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists and is a reader
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'READER') {
      return NextResponse.json(
        { error: 'User not found or not a reader' },
        { status: 404 }
      );
    }

    // Create Connect account
    const result = await StripeService.createConnectAccount({
      userId,
      email,
      country,
      type: type || 'express',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update reader profile with Stripe account ID
    await db.reader.update({
      where: { userId: userId },
      data: { stripeAccountId: result.accountId },
    });

    return NextResponse.json({
      success: true,
      accountId: result.accountId,
      account: result.account,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
