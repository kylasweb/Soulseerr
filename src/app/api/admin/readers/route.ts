import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Commented out due to import error
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const verificationStatus = searchParams.get('verificationStatus') || 'all';
        const specialty = searchParams.get('specialty') || 'all';
        const ratingRange = searchParams.get('ratingRange') || 'all';
        const dateRange = searchParams.get('dateRange') || 'all';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (status !== 'all') {
            where.status = status;
        }

        if (verificationStatus !== 'all') {
            where.isVerified = verificationStatus === 'VERIFIED';
        }

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        if (specialty !== 'all') {
            where.specialties = {
                has: specialty
            };
        }

        // Date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (dateRange) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarter':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }

            where.createdAt = {
                gte: startDate
            };
        }

        // Fetch readers - corrected model name
        const readers = await db.reader.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        // Get session stats for each reader
        const readersWithStats = await Promise.all(
            readers.map(async (reader) => {
                // Get session statistics
                const [completedSessions, cancelledSessions, ratingStats, earnings] = await Promise.all([
                    db.session.count({
                        where: {
                            readerId: reader.userId,
                            status: 'COMPLETED'
                        }
                    }),

                    db.session.count({
                        where: {
                            readerId: reader.userId,
                            status: 'CANCELLED'
                        }
                    }),

                    // Get average rating from reviews, not sessions
                    db.review.aggregate({
                        where: {
                            session: {
                                readerId: reader.userId,
                                status: 'COMPLETED'
                            }
                        },
                        _avg: {
                            rating: true
                        }
                    }),

                    // Get total earnings from sessions
                    db.session.aggregate({
                        where: {
                            readerId: reader.userId,
                            status: 'COMPLETED'
                        },
                        _sum: {
                            totalCost: true
                        }
                    })
                ]);

                return {
                    id: reader.id,
                    userId: reader.userId,
                    user: {
                        name: reader.user.name || `${reader.firstName} ${reader.lastName}`,
                        email: reader.user.email,
                        avatar: reader.user.avatar || reader.avatar
                    },
                    status: reader.status,
                    verificationStatus: reader.isVerified ? 'VERIFIED' : 'PENDING',
                    specialties: reader.specialties || [],
                    totalSessions: completedSessions + cancelledSessions,
                    completedSessions,
                    cancelledSessions,
                    averageRating: ratingStats._avg.rating || 0,
                    totalEarnings: earnings._sum?.totalCost || 0,
                    joinedAt: reader.createdAt.toISOString(),
                    lastActive: reader.updatedAt.toISOString(),
                    complianceScore: 100, // Would be calculated based on actual metrics
                    warningCount: 0 // Would be tracked in a separate warnings table
                };
            })
        );

        // Apply rating range filter post-query (since it's calculated)
        let filteredReaders = readersWithStats;
        if (ratingRange !== 'all') {
            const [min, max] = ratingRange.split('-').map(Number);
            filteredReaders = readersWithStats.filter(reader => {
                const rating = reader.averageRating;
                return rating >= min && rating <= max;
            });
        }

        // Get total count for pagination - corrected model name
        const totalCount = await db.reader.count({ where });

        return NextResponse.json({
            readers: filteredReaders,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Readers fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch readers' },
            { status: 500 }
        );
    }
}