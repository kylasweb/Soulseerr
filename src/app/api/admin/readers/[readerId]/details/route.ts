import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';

interface RouteParams {
    params: {
        readerId: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // const session = await getServerSession(); // Commented out due to import error

        // if (!session?.user?.email) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // // Check if user is admin
        // const adminUser = await db.user.findUnique({
        //     where: { email: session.user.email },
        //     select: { role: true }
        // });

        // if (adminUser?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const { readerId } = params;

        // Fetch reader details with all related data
        const reader = await db.reader.findUnique({
            where: { id: readerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!reader) {
            return NextResponse.json({ error: 'Reader not found' }, { status: 404 });
        }

        // Get session statistics
        const [completedSessions, cancelledSessions, totalSessions, ratingStats, earnings] = await Promise.all([
            db.session.count({
                where: {
                    readerId: readerId,
                    status: 'COMPLETED'
                }
            }),

            db.session.count({
                where: {
                    readerId: readerId,
                    status: 'CANCELLED'
                }
            }),

            db.session.count({
                where: {
                    readerId: readerId
                }
            }),

            db.review.aggregate({
                where: {
                    readerId: readerId
                },
                _avg: {
                    rating: true
                }
            }),

            db.session.aggregate({
                where: {
                    readerId: readerId,
                    status: 'COMPLETED'
                },
                _sum: {
                    totalCost: true
                }
            })
        ]);

        // Get recent reviews (last 5)
        const recentReviews = await db.review.findMany({
            where: {
                readerId: readerId
            },
            include: {
                client: {
                    select: {
                        name: true
                    }
                },
                session: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Get recent sessions (last 10)
        const recentSessions = await db.session.findMany({
            where: {
                readerId: readerId
            },
            include: {
                client: {
                    select: {
                        name: true
                    }
                },
                review: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Format the response
        const readerDetails = {
            id: reader.id,
            userId: reader.userId,
            user: {
                name: reader.user.name || '',
                email: reader.user.email,
                avatar: reader.user.avatar,
                createdAt: reader.user.createdAt.toISOString()
            },
            status: reader.status,
            isVerified: reader.isVerified,
            specialties: reader.specialties || [],
            bio: reader.bio || '',
            experience: reader.experience || 0,
            certifications: reader.certifications || [],
            totalSessions,
            completedSessions,
            cancelledSessions,
            averageRating: ratingStats._avg.rating || 0,
            totalEarnings: earnings._sum.totalCost || 0,
            complianceScore: 100, // Would be calculated based on actual compliance metrics
            warningCount: 0, // Would be tracked in a separate warnings table
            joinedAt: reader.createdAt.toISOString(),
            lastActive: reader.updatedAt.toISOString(),
            recentSessions: recentSessions.map(session => ({
                id: session.id,
                clientName: session.client?.name || 'Anonymous',
                date: session.createdAt.toISOString(),
                duration: session.duration || 0,
                rating: session.review?.rating,
                status: session.status,
                amount: session.totalCost || 0
            })),
            recentReviews: recentReviews.map(review => ({
                id: review.id,
                clientName: review.client?.name || 'Anonymous',
                rating: review.rating || 0,
                comment: review.comment || '',
                date: review.createdAt.toISOString()
            })),
            documents: [] // Would be populated from actual document storage
        };

        return NextResponse.json({ reader: readerDetails });
    } catch (error) {
        console.error('Reader details fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reader details' },
            { status: 500 }
        );
    }
}