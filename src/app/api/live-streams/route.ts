import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build the query
        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        }

        if (category) {
            whereClause.category = category;
        }

        const streams = await db.liveStream.findMany({
            where: whereClause,
            include: {
                reader: {
                    include: {
                        readerProfile: true
                    }
                }
            },
            orderBy: [
                { status: 'desc' }, // LIVE first
                { scheduledAt: 'asc' },
                { createdAt: 'desc' }
            ],
            take: limit
        });

        const formattedStreams = streams.map(stream => ({
            id: stream.id,
            title: stream.title,
            description: stream.description,
            status: stream.status,
            category: stream.category,
            thumbnail: null, // No thumbnail field in schema
            viewerCount: stream.viewerCount,
            scheduledAt: stream.scheduledAt,
            startedAt: stream.startedAt,
            endedAt: stream.endedAt,
            reader: {
                id: stream.reader.id,
                name: stream.reader.name || 'Anonymous Reader',
                avatar: stream.reader.avatar,
                specialties: stream.reader.readerProfile?.specialties || [],
                rating: stream.reader.readerProfile?.averageRating || 0,
                totalReadings: stream.reader.readerProfile?.totalSessions || 0
            },
            createdAt: stream.createdAt,
            updatedAt: stream.updatedAt
        }));

        return NextResponse.json({
            success: true,
            streams: formattedStreams
        });

    } catch (error) {
        console.error('Live streams API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch live streams' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'READER') {
            return NextResponse.json(
                { success: false, error: 'Reader access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, category, scheduledAt } = body;

        if (!title || !description) {
            return NextResponse.json(
                { success: false, error: 'Title and description are required' },
                { status: 400 }
            );
        }

        // Check if user already has an active stream
        const existingStream = await db.liveStream.findFirst({
            where: {
                readerId: user.userId,
                status: { in: ['SCHEDULED', 'LIVE'] }
            }
        });

        if (existingStream) {
            return NextResponse.json(
                { success: false, error: 'You already have an active stream' },
                { status: 409 }
            );
        }

        const streamData: any = {
            title,
            description,
            category: category || 'General',
            readerId: user.userId,
            status: scheduledAt ? 'SCHEDULED' : 'LIVE'
        };

        if (scheduledAt) {
            streamData.scheduledAt = new Date(scheduledAt);
        } else {
            streamData.startedAt = new Date();
        }

        const stream = await db.liveStream.create({
            data: streamData,
            include: {
                reader: {
                    include: {
                        readerProfile: true
                    }
                }
            }
        });

        const formattedStream = {
            id: stream.id,
            title: stream.title,
            description: stream.description,
            status: stream.status,
            category: stream.category,
            thumbnail: null, // No thumbnail field in schema
            viewerCount: stream.viewerCount || 0,
            messageCount: 0, // Placeholder
            scheduledAt: stream.scheduledAt,
            startedAt: stream.startedAt,
            endedAt: stream.endedAt,
            reader: {
                id: stream.reader.id,
                name: stream.reader.name || 'Anonymous Reader',
                avatar: stream.reader.avatar,
                specialties: stream.reader.readerProfile?.specialties || [],
                rating: stream.reader.readerProfile?.averageRating || 0,
                totalReadings: stream.reader.readerProfile?.totalSessions || 0
            },
            createdAt: stream.createdAt,
            updatedAt: stream.updatedAt
        };

        return NextResponse.json({
            success: true,
            stream: formattedStream
        });

    } catch (error) {
        console.error('Create live stream API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create live stream' },
            { status: 500 }
        );
    }
}