import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

const createProductSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    type: z.enum(['SERVICE', 'DIGITAL', 'PHYSICAL']),
    price: z.number().min(0),
    category: z.string().min(1).max(100),
    tags: z.array(z.string()).max(10).optional(),
    content: z.object({
        fileUrl: z.string().url().optional(),
        downloadUrl: z.string().url().optional(),
        streamUrl: z.string().url().optional(),
        duration: z.number().optional(), // for audio/video content
        pageCount: z.number().optional(), // for ebooks/guides
    }).optional(),
    previewContent: z.string().optional(),
    requirements: z.array(z.string()).optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    isActive: z.boolean().default(true),
})

const updateProductSchema = createProductSchema.partial()

const getProductsSchema = z.object({
    type: z.enum(['SERVICE', 'DIGITAL', 'PHYSICAL']).optional(),
    category: z.string().optional(),
    readerId: z.string().optional(),
    minPrice: z.string().transform(val => parseFloat(val)).optional(),
    maxPrice: z.string().transform(val => parseFloat(val)).optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'price', 'rating', 'purchases']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    limit: z.string().optional().default('20').transform(val => parseInt(val)),
    offset: z.string().optional().default('0').transform(val => parseInt(val)),
})

// GET /api/products - Get marketplace products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const validatedParams = getProductsSchema.parse({
            type: searchParams.get('type'),
            category: searchParams.get('category'),
            readerId: searchParams.get('readerId'),
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
            difficulty: searchParams.get('difficulty'),
            search: searchParams.get('search'),
            sortBy: searchParams.get('sortBy'),
            sortOrder: searchParams.get('sortOrder'),
            limit: searchParams.get('limit'),
            offset: searchParams.get('offset'),
        })

        let whereClause: any = {
            isActive: true,
            deletedAt: null,
        }

        // Apply filters
        if (validatedParams.type) whereClause.type = validatedParams.type
        if (validatedParams.category) whereClause.category = validatedParams.category
        if (validatedParams.readerId) whereClause.readerId = validatedParams.readerId
        if (validatedParams.difficulty) whereClause.difficulty = validatedParams.difficulty

        if (validatedParams.minPrice !== undefined || validatedParams.maxPrice !== undefined) {
            whereClause.price = {}
            if (validatedParams.minPrice !== undefined) whereClause.price.gte = validatedParams.minPrice
            if (validatedParams.maxPrice !== undefined) whereClause.price.lte = validatedParams.maxPrice
        }

        if (validatedParams.search) {
            whereClause.OR = [
                { title: { contains: validatedParams.search, mode: 'insensitive' } },
                { description: { contains: validatedParams.search, mode: 'insensitive' } },
                { category: { contains: validatedParams.search, mode: 'insensitive' } },
                { tags: { hasSome: [validatedParams.search] } },
            ]
        }

        // Build order by clause
        let orderBy: any
        switch (validatedParams.sortBy) {
            case 'price':
                orderBy = { price: validatedParams.sortOrder }
                break
            case 'rating':
                orderBy = { averageRating: validatedParams.sortOrder }
                break
            case 'purchases':
                orderBy = { totalSales: validatedParams.sortOrder }
                break
            default:
                orderBy = { createdAt: validatedParams.sortOrder }
        }

        const products = await db.product.findMany({
            where: whereClause,
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
                                averageRating: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        orderItems: true,
                    }
                }
            },
            orderBy,
            take: validatedParams.limit,
            skip: validatedParams.offset,
        })

        const totalCount = await db.product.count({ where: whereClause })

        // Get categories for filtering
        const categories = await db.product.groupBy({
            by: ['category'],
            where: { status: 'ACTIVE' },
            _count: { category: true },
            orderBy: { _count: { category: 'desc' } },
        })

        return NextResponse.json({
            products,
            pagination: {
                total: totalCount,
                limit: validatedParams.limit,
                offset: validatedParams.offset,
                hasMore: validatedParams.offset + validatedParams.limit < totalCount,
            },
            categories,
            filters: {
                types: ['GUIDE', 'MEDITATION', 'COURSE', 'EBOOK', 'AUDIO', 'VIDEO', 'BUNDLE'],
                difficulties: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
            }
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Get products error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/products - Create new product (readers only)
export async function POST(request: NextRequest) {
    return withAuth(async (req: AuthenticatedRequest) => {
        try {
            if (req.user!.role !== 'READER') {
                return NextResponse.json(
                    { error: 'Forbidden - Reader access required' },
                    { status: 403 }
                )
            }

            const body = await request.json()
            const validatedData = createProductSchema.parse(body)

            // Verify user exists
            const user = await db.user.findUnique({
                where: { id: req.user!.userId },
            })

            if (!user || user.role !== 'READER') {
                return NextResponse.json(
                    { error: 'Reader profile must be approved to create products' },
                    { status: 403 }
                )
            }

            const product = await db.product.create({
                data: {
                    readerId: req.user!.userId,
                    name: validatedData.title,
                    description: validatedData.description,
                    type: validatedData.type,
                    category: validatedData.category,
                    price: validatedData.price,
                    currency: 'USD',
                    images: JSON.stringify([]), // Empty images array
                    downloadUrl: validatedData.content?.downloadUrl,
                    fileUrl: validatedData.content?.fileUrl,
                    status: validatedData.isActive ? 'ACTIVE' : 'DRAFT',
                },
                include: {
                    reader: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            })

            return NextResponse.json(product, { status: 201 })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid request data', details: error.issues },
                    { status: 400 }
                )
            }

            console.error('Create product error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    })(request)
}
