import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { accountId, returnUrl, refreshUrl } = await request.json();

    if (!accountId || !returnUrl || !refreshUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the account belongs to a reader
    const readerProfile = await db.reader.findFirst({
      where: { stripeAccountId: accountId },
    });

    if (!readerProfile) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Create account link
    const result = await StripeService.createAccountLink(
      accountId,
      returnUrl,
      refreshUrl
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
