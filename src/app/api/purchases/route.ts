import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { NotificationService } from '@/lib/notification-service'

const createPurchaseSchema = z.object({
    productId: z.string(),
    paymentMethodId: z.string().optional(), // For Stripe payment method
})

const getPurchasesSchema = z.object({
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
    productType: z.enum(['GUIDE', 'MEDITATION', 'COURSE', 'EBOOK', 'AUDIO', 'VIDEO', 'BUNDLE']).optional(),
    limit: z.string().optional().default('20').transform(val => parseInt(val)),
    offset: z.string().optional().default('0').transform(val => parseInt(val)),
})

// GET /api/purchases - Get user's purchases
export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(req.url)
        const validatedParams = getPurchasesSchema.parse({
            status: searchParams.get('status'),
            productType: searchParams.get('productType'),
            limit: searchParams.get('limit'),
            offset: searchParams.get('offset'),
        })

        let whereClause: any = {
            userId: req.user!.userId,
        }

        if (validatedParams.status) {
            whereClause.status = validatedParams.status
        }

        if (validatedParams.productType) {
            whereClause.product = { type: validatedParams.productType }
        }

        const purchases = await db.purchase.findMany({
            where: whereClause,
            include: {
                product: {
                    include: {
                        reader: {
                            select: {
                                id: true,
                                username: true,
                                readerProfile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        avatar: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: validatedParams.limit,
            skip: validatedParams.offset,
        })

        const totalCount = await db.purchase.count({ where: whereClause })

        return NextResponse.json({
            purchases,
            pagination: {
                total: totalCount,
                limit: validatedParams.limit,
                offset: validatedParams.offset,
                hasMore: validatedParams.offset + validatedParams.limit < totalCount,
            }
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Get purchases error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

// POST /api/purchases - Create new purchase
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json()
        const validatedData = createPurchaseSchema.parse(body)

        const userId = req.user!.userId

        // Check if product exists and is active
        const product = await db.product.findUnique({
            where: {
                id: validatedData.productId,
                status: 'ACTIVE',
            },
            include: {
                reader: { select: { id: true } }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found or not available' },
                { status: 404 }
            )
        }

        // Check if user already owns this product
        const existingPurchase = await db.purchase.findFirst({
            where: {
                userId,
                productId: validatedData.productId,
                status: 'COMPLETED',
            }
        })

        if (existingPurchase) {
            return NextResponse.json(
                { error: 'You already own this product' },
                { status: 400 }
            )
        }

        // Check if user is trying to buy their own product
        if (product.readerId === userId) {
            return NextResponse.json(
                { error: 'You cannot purchase your own product' },
                { status: 400 }
            )
        }

        // Get user's wallet balance
        const wallet = await db.wallet.findUnique({
            where: { userId },
        })

        if (!wallet || wallet.balance < product.price) {
            return NextResponse.json(
                { error: 'Insufficient wallet balance' },
                { status: 400 }
            )
        }

        // Create purchase and handle payment in a transaction
        const result = await db.$transaction(async (prisma) => {
            // Create the purchase
            const purchase = await prisma.purchase.create({
                data: {
                    userId,
                    productId: validatedData.productId,
                    amount: product.price,
                    status: 'COMPLETED', // Instant completion for wallet purchases
                },
            })

            // Deduct from buyer's wallet
            await prisma.wallet.update({
                where: { userId },
                data: { balance: { decrement: product.price } },
            })

            // Add to reader's wallet (minus platform fee)
            const platformFeeRate = 0.1 // 10% platform fee
            const readerAmount = product.price * (1 - platformFeeRate)
            const platformFee = product.price * platformFeeRate

            await prisma.wallet.upsert({
                where: { userId: product.readerId! },
                create: {
                    userId: product.readerId!,
                    balance: readerAmount,
                },
                update: {
                    balance: { increment: readerAmount },
                },
            })

            // Create transaction records
            await prisma.transaction.createMany({
                data: [
                    {
                        transactionId: `purchase-${userId}-${Date.now()}`,
                        userId,
                        type: 'PURCHASE',
                        amount: -product.price,
                        status: 'COMPLETED',
                        description: `Purchased: ${product.name}`,
                    },
                    ...(product.readerId ? [{
                        transactionId: `sale-${product.readerId}-${Date.now()}`,
                        userId: product.readerId,
                        type: 'PAYOUT' as const,
                        amount: readerAmount,
                        status: 'COMPLETED' as const,
                        description: `Sale: ${product.name}`,
                    }] : [])
                ]
            })

            // Product statistics would be updated here if the fields existed
            // await prisma.product.update({
            //     where: { id: validatedData.productId },
            //     data: {
            //         // No sales statistics fields in current schema
            //     },
            // })

            return purchase
        })

        // Send notifications
        if (product.readerId) {
            try {
                await NotificationService.createNotification({
                    userId: product.readerId,
                    title: 'New Product Sale!',
                    message: `Your product "${product.name}" was purchased for $${product.price}`,
                    type: 'PAYMENT_RECEIVED',
                })
            } catch (notificationError) {
                console.error('Failed to send notification:', notificationError)
                // Don't fail the purchase if notification fails
            }
        }

        // Return purchase with product details
        const purchaseWithDetails = await db.purchase.findUnique({
            where: { id: result.id },
            include: {
                product: {
                    include: {
                        reader: {
                            select: {
                                id: true,
                                username: true,
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(purchaseWithDetails, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: (error as z.ZodError).issues },
                { status: 400 }
            )
        }

        console.error('Create purchase error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})
