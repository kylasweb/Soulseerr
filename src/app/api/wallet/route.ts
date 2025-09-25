import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
})

const addFundsSchema = z.object({
    amount: z.number().min(5).max(1000), // $5 to $1000
    paymentMethodId: z.string(),
})

// POST /api/wallet/add-funds - Add funds to wallet
export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json()
        const validatedData = addFundsSchema.parse(body)
        const userId = request.user!.userId

        // Get user and wallet
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { wallet: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.wallet) {
            // Create wallet if it doesn't exist
            await db.wallet.create({
                data: {
                    userId,
                    balance: 0,
                }
            })
        }

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(validatedData.amount * 100), // Convert to cents
            currency: 'usd',
            payment_method: validatedData.paymentMethodId,
            confirm: true,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
            metadata: {
                userId,
                type: 'wallet_top_up',
            },
        })

        if (paymentIntent.status === 'succeeded') {
            // Generate unique transaction ID
            const transactionId = `tx_${Date.now()}_wallet_${userId}`

            // Add funds to wallet and create transaction
            await db.$transaction([
                db.wallet.update({
                    where: { userId },
                    data: {
                        balance: { increment: validatedData.amount }
                    }
                }),
                db.transaction.create({
                    data: {
                        transactionId,
                        userId,
                        type: 'ADD_FUNDS',
                        amount: validatedData.amount,
                        description: 'Wallet top-up via credit card',
                        status: 'COMPLETED',
                        stripePaymentIntentId: paymentIntent.id,
                    }
                })
            ])

            return NextResponse.json({
                message: 'Funds added successfully',
                amount: validatedData.amount,
                paymentIntentId: paymentIntent.id,
            })
        }

        return NextResponse.json(
            { error: 'Payment failed', details: paymentIntent.last_payment_error?.message },
            { status: 400 }
        )

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Add funds error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

// GET /api/wallet - Get wallet balance and recent transactions
export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const userId = request.user!.userId
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        const wallet = await db.wallet.findUnique({
            where: { userId }
        })

        if (!wallet) {
            // Create wallet if it doesn't exist
            const newWallet = await db.wallet.create({
                data: {
                    userId,
                    balance: 0,
                }
            })

            return NextResponse.json({
                wallet: newWallet,
                transactions: [],
                pagination: { total: 0, limit, offset, hasMore: false }
            })
        }

        const transactions = await db.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        })

        const totalTransactions = await db.transaction.count({
            where: { userId }
        })

        return NextResponse.json({
            wallet,
            transactions,
            pagination: {
                total: totalTransactions,
                limit,
                offset,
                hasMore: offset + limit < totalTransactions
            }
        })

    } catch (error) {
        console.error('Get wallet error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})
