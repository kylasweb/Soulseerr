import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

const updateProductSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    type: z.enum(['SERVICE', 'DIGITAL', 'PHYSICAL']).optional(),
    price: z.number().min(0).optional(),
    category: z.string().min(1).max(100).optional(),
    tags: z.array(z.string()).max(10).optional(),
    content: z.object({
        fileUrl: z.string().url().optional(),
        downloadUrl: z.string().url().optional(),
        streamUrl: z.string().url().optional(),
        duration: z.number().optional(),
        pageCount: z.number().optional(),
    }).optional(),
    previewContent: z.string().optional(),
    requirements: z.array(z.string()).optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    isActive: z.boolean().optional(),
})

// GET /api/products/[productId] - Get single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params

        const product = await db.product.findUnique({
            where: {
                id: productId,
                status: 'ACTIVE',
            },
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
                                bio: true,
                                averageRating: true,
                                totalSessions: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        orderItems: true,
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Check if product is active (unless it's the owner or admin viewing)
        if (product.status !== 'ACTIVE') {
            // Only allow owner or admin to view inactive products
            const auth = request.headers.get('authorization')
            if (auth) {
                // This is a simplified auth check - in practice you'd validate the JWT
                // For now, we'll assume non-active products are visible to everyone for demo
            } else {
                return NextResponse.json(
                    { error: 'Product not available' },
                    { status: 404 }
                )
            }
        }

        // Get related products from the same reader
        const relatedProducts = await db.product.findMany({
            where: {
                readerId: product.readerId,
                id: { not: productId },
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                price: true,
                type: true,
            },
            take: 4,
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            ...product,
            relatedProducts,
        })

    } catch (error) {
        console.error('Get product error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT /api/products/[productId] - Update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            const { productId } = await params
            const body = await req.json()
            const validatedData = updateProductSchema.parse(body)

            // Check if product exists and user has permission
            const existingProduct = await db.product.findUnique({
                where: {
                    id: productId,
                },
            })

            if (!existingProduct) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                )
            }

            // Check permission (owner or admin)
            if (existingProduct.readerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: 'Forbidden - You can only edit your own products' },
                    { status: 403 }
                )
            }

            // Map validated data to Prisma schema fields
            const updateData: any = {}
            if (validatedData.title) updateData.name = validatedData.title
            if (validatedData.description) updateData.description = validatedData.description
            if (validatedData.type) updateData.type = validatedData.type
            if (validatedData.price !== undefined) updateData.price = validatedData.price
            if (validatedData.category) updateData.category = validatedData.category
            if (validatedData.content?.fileUrl) updateData.fileUrl = validatedData.content.fileUrl
            if (validatedData.content?.downloadUrl) updateData.downloadUrl = validatedData.content.downloadUrl
            if (validatedData.isActive !== undefined) updateData.status = validatedData.isActive ? 'ACTIVE' : 'DRAFT'

            const updatedProduct = await db.product.update({
                where: { id: productId },
                data: updateData,
                include: {
                    reader: {
                        select: {
                            id: true,
                            username: true,
                        }
                    },
                    _count: {
                        select: {
                            orderItems: true,
                        }
                    }
                }
            })

            return NextResponse.json(updatedProduct)

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Update product error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            const { productId } = await params

            // Check if product exists and user has permission
            const existingProduct = await db.product.findUnique({
                where: {
                    id: productId,
                },
            })

            if (!existingProduct) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                )
            }

            // Check permission (owner or admin)
            if (existingProduct.readerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
                return NextResponse.json(
                    { error: 'Forbidden - You can only delete your own products' },
                    { status: 403 }
                )
            }

            // Check if product has active purchases
            const hasPurchases = await db.purchase.findFirst({
                where: { productId },
            })

            if (hasPurchases) {
                // Soft delete by setting status to inactive to preserve purchase history
                await db.product.update({
                    where: { id: productId },
                    data: {
                        status: 'INACTIVE',
                    },
                })
            } else {
                // Hard delete if no purchases exist
                await db.product.delete({
                    where: { id: productId },
                })
            }

            return NextResponse.json({
                message: 'Product deleted successfully'
            })

        } catch (error) {
            console.error('Delete product error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}