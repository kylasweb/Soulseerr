// Seed script for community features
import { db } from '../src/lib/db';

async function seedCommunityFeatures() {
    console.log('🌱 Seeding community features...');

    try {
        // Create forum categories
        const categories = [
            {
                name: 'General Discussion',
                description: 'General spiritual discussions and conversations',
                slug: 'general',
                color: '#6B7280',
                icon: 'MessageSquare',
                order: 1
            },
            {
                name: 'Tarot & Card Reading',
                description: 'Share your tarot insights, card meanings, and reading experiences',
                slug: 'tarot',
                color: '#7C3AED',
                icon: 'Sparkles',
                order: 2
            },
            {
                name: 'Astrology',
                description: 'Discuss planetary movements, birth charts, and cosmic energies',
                slug: 'astrology',
                color: '#0EA5E9',
                icon: 'Star',
                order: 3
            },
            {
                name: 'Crystal Healing',
                description: 'Crystal properties, healing techniques, and energy work',
                slug: 'crystals',
                color: '#10B981',
                icon: 'Gem',
                order: 4
            },
            {
                name: 'Meditation & Mindfulness',
                description: 'Meditation practices, mindfulness techniques, and inner peace',
                slug: 'meditation',
                color: '#F59E0B',
                icon: 'Heart',
                order: 5
            },
            {
                name: 'Dream Interpretation',
                description: 'Share and interpret dreams, symbols, and subconscious messages',
                slug: 'dreams',
                color: '#8B5CF6',
                icon: 'Moon',
                order: 6
            },
            {
                name: 'Spiritual Experiences',
                description: 'Personal spiritual journeys, awakenings, and mystical experiences',
                slug: 'experiences',
                color: '#EC4899',
                icon: 'Zap',
                order: 7
            },
            {
                name: 'Reader Support',
                description: 'Support and resources for spiritual readers and practitioners',
                slug: 'reader-support',
                color: '#14B8A6',
                icon: 'Users',
                order: 8
            }
        ];

        console.log('Creating forum categories...');
        for (const category of categories) {
            const existingCategory = await db.forumCategory.findUnique({
                where: { slug: category.slug }
            });

            if (!existingCategory) {
                await db.forumCategory.create({
                    data: category
                });
                console.log(`✅ Created category: ${category.name}`);
            } else {
                console.log(`⏭️  Category already exists: ${category.name}`);
            }
        }

        // Create some sample users for testing (if they don't exist)
        console.log('Creating sample users...');
        const sampleUsers = [
            {
                email: 'mystic.reader@example.com',
                name: 'Mystic Oracle',
                role: 'READER',
                coinBalance: 1000,
                profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'crystal.healer@example.com',
                name: 'Crystal Sage',
                role: 'READER',
                coinBalance: 750,
                profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b1d5?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'seeker.soul@example.com',
                name: 'Spiritual Seeker',
                role: 'CLIENT',
                coinBalance: 500,
                profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
        ];

        for (const userData of sampleUsers) {
            const existingUser = await db.user.findUnique({
                where: { email: userData.email }
            });

            if (!existingUser) {
                await db.user.create({
                    data: {
                        ...userData,
                        role: userData.role as any,
                        status: 'ACTIVE',
                        provider: 'EMAIL'
                    }
                });
                console.log(`✅ Created user: ${userData.name}`);
            } else {
                console.log(`⏭️  User already exists: ${userData.name}`);
            }
        }

        // Create some sample forum posts
        console.log('Creating sample forum posts...');
        const generalCategory = await db.forumCategory.findUnique({
            where: { slug: 'general' }
        });

        const tarotCategory = await db.forumCategory.findUnique({
            where: { slug: 'tarot' }
        });

        const mysticReader = await db.user.findUnique({
            where: { email: 'mystic.reader@example.com' }
        });

        const crystalHealer = await db.user.findUnique({
            where: { email: 'crystal.healer@example.com' }
        });

        if (generalCategory && mysticReader) {
            const existingPost = await db.forumPost.findFirst({
                where: {
                    title: 'Welcome to the SoulSeer Community!',
                    authorId: mysticReader.id
                }
            });

            if (!existingPost) {
                await db.forumPost.create({
                    data: {
                        title: 'Welcome to the SoulSeer Community!',
                        content: 'Hello everyone! 🌟 Welcome to our spiritual community where we can share experiences, insights, and support each other on our spiritual journeys. Feel free to introduce yourself and share what brings you to the mystical arts. Whether you\'re a seasoned practitioner or just beginning your journey, this is a safe space for all. Blessed be! ✨',
                        categoryId: generalCategory.id,
                        authorId: mysticReader.id,
                        isPinned: true
                    }
                });
                console.log('✅ Created welcome post');
            }
        }

        if (tarotCategory && crystalHealer) {
            const existingPost = await db.forumPost.findFirst({
                where: {
                    title: 'Daily Tarot Spread Ideas',
                    authorId: crystalHealer.id
                }
            });

            if (!existingPost) {
                await db.forumPost.create({
                    data: {
                        title: 'Daily Tarot Spread Ideas',
                        content: 'I wanted to share some of my favorite daily tarot spreads that have been incredibly insightful for my practice:\n\n🔮 **Morning Guidance (3 cards):**\n- What I need to know today\n- Challenge to be aware of\n- How to approach the day\n\n🔮 **Evening Reflection (3 cards):**\n- What went well today\n- What I learned\n- What to carry forward\n\nWhat are your favorite daily spreads? Share them below! 💫',
                        categoryId: tarotCategory.id,
                        authorId: crystalHealer.id
                    }
                });
                console.log('✅ Created tarot spread post');
            }
        }

        console.log('🎉 Community features seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding community features:', error);
        throw error;
    }
}

// Run the seed function
if (require.main === module) {
    seedCommunityFeatures()
        .catch((e) => {
            console.error('Seeding failed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await db.$disconnect();
        });
}

export { seedCommunityFeatures };