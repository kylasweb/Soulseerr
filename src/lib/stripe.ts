import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

interface CreateConnectAccountParams {
  userId: string;
  email: string;
  country: string;
  type: 'express' | 'custom';
}

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  sessionId: string;
  userId: string;
}

interface TransferParams {
  amount: number;
  destination: string;
  sessionId: string;
  description?: string;
}

export class StripeService {
  /**
   * Create a Stripe Connect account for a reader
   */
  static async createConnectAccount(params: CreateConnectAccountParams) {
    try {
      const account = await stripe.accounts.create({
        type: params.type,
        country: params.country,
        email: params.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: 'Spiritual Reader',
        },
        metadata: {
          userId: params.userId,
        },
      });

      return {
        success: true,
        accountId: account.id,
        account: account,
      };
    } catch (error) {
      console.error('Error creating Connect account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create an account link for onboarding
   */
  static async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return {
        success: true,
        url: accountLink.url,
      };
    } catch (error) {
      console.error('Error creating account link:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a payment intent for session booking
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency,
        metadata: {
          sessionId: params.sessionId,
          userId: params.userId,
        },
        description: `Payment for session ${params.sessionId}`,
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a transfer to a Connect account
   */
  static async createTransfer(params: TransferParams) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: 'usd',
        destination: params.destination,
        description: params.description || `Transfer for session ${params.sessionId}`,
        metadata: {
          sessionId: params.sessionId,
        },
      });

      return {
        success: true,
        transferId: transfer.id,
        transfer: transfer,
      };
    } catch (error) {
      console.error('Error creating transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve account balance
   */
  static async getAccountBalance(accountId: string) {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      return {
        success: true,
        balance: balance,
      };
    } catch (error) {
      console.error('Error retrieving account balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a payout from Connect account
   */
  static async createPayout(accountId: string, amount: number, currency = 'usd') {
    try {
      const payout = await stripe.payouts.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
        },
        {
          stripeAccount: accountId,
        }
      );

      return {
        success: true,
        payoutId: payout.id,
        payout: payout,
      };
    } catch (error) {
      console.error('Error creating payout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object as Stripe.Payout);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle successful payment intent
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { sessionId, userId } = paymentIntent.metadata;

    // Update session status in database
    // This would be implemented with your database client
    console.log(`Payment succeeded for session ${sessionId}, user ${userId}`);

    // Update wallet balance
    // This would be implemented with your database client
  }

  /**
   * Handle failed payment intent
   */
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { sessionId, userId } = paymentIntent.metadata;

    // Update session status in database
    console.log(`Payment failed for session ${sessionId}, user ${userId}`);
  }

  /**
   * Handle account update
   */
  private static async handleAccountUpdated(account: Stripe.Account) {
    const userId = account.metadata?.userId;

    if (!userId) {
      console.log('No userId in account metadata');
      return;
    }

    // Update reader account status in database
    console.log(`Account updated for user ${userId}`);
  }

  /**
   * Handle transfer creation
   */
  private static async handleTransferCreated(transfer: Stripe.Transfer) {
    const sessionId = transfer.metadata.sessionId;

    // Update transfer status in database
    console.log(`Transfer created for session ${sessionId}`);
  }

  /**
   * Handle successful transfer
   */
  private static async handleTransferPaid(transfer: Stripe.Transfer) {
    const sessionId = transfer.metadata.sessionId;

    // Update transfer status in database
    console.log(`Transfer paid for session ${sessionId}`);
  }

  /**
   * Handle successful payout
   */
  private static async handlePayoutPaid(payout: Stripe.Payout) {
    // Update payout status in database
    console.log(`Payout paid: ${payout.id}`);
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string, webhookSecret: string) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return { success: true, event };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}