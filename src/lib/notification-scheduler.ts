import { NotificationService } from '@/lib/notification-service';
import { db } from '@/lib/db';

export class NotificationScheduler {
    private static instance: NotificationScheduler;
    private reminderInterval: NodeJS.Timeout | null = null;

    static getInstance(): NotificationScheduler {
        if (!NotificationScheduler.instance) {
            NotificationScheduler.instance = new NotificationScheduler();
        }
        return NotificationScheduler.instance;
    }

    // Start the reminder scheduler
    startReminderService(intervalMinutes: number = 5) {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }

        this.reminderInterval = setInterval(async () => {
            try {
                await this.processSessionReminders();
            } catch (error) {
                console.error('Error in reminder service:', error);
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`Notification scheduler started with ${intervalMinutes} minute intervals`);
    }

    stopReminderService() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = null;
            console.log('Notification scheduler stopped');
        }
    }

    // Process session reminders
    private async processSessionReminders() {
        const now = new Date();
        const reminderTimes = [
            { minutes: 15, sent: false },
            { minutes: 5, sent: false },
            { minutes: 1, sent: false }
        ];

        for (const reminder of reminderTimes) {
            const reminderTime = new Date(now.getTime() + reminder.minutes * 60 * 1000);
            const windowStart = new Date(reminderTime.getTime() - 30000); // 30 seconds before
            const windowEnd = new Date(reminderTime.getTime() + 30000); // 30 seconds after

            const upcomingSessions = await db.sessionBooking.findMany({
                where: {
                    selectedDateTime: {
                        gte: windowStart,
                        lte: windowEnd
                    },
                    status: 'CONFIRMED'
                },
                include: {
                    client: { select: { id: true, name: true, displayName: true, email: true } },
                    reader: { select: { id: true, name: true, displayName: true, email: true } }
                }
            });

            for (const booking of upcomingSessions) {
                await this.sendSessionReminder(booking, reminder.minutes);
            }
        }
    }

    private async sendSessionReminder(booking: any, minutesBefore: number) {
        try {
            // Check if reminder already sent (you could add a reminder tracking table)
            const reminderKey = `reminder_${booking.id}_${minutesBefore}m`;

            // Client reminder
            await NotificationService.createNotification({
                userId: booking.client.id,
                type: 'SESSION_REMINDER',
                title: '🔔 Session Starting Soon',
                message: `Your session with ${booking.reader.name} starts in ${minutesBefore} minute${minutesBefore !== 1 ? 's' : ''}`,
                metadata: {
                    bookingId: booking.id,
                    minutesBefore,
                    readerName: booking.reader.name,
                    sessionTime: booking.scheduledDateTime,
                    actionUrl: `/sessions/${booking.id}`
                }
            });

            // Reader reminder
            await NotificationService.createNotification({
                userId: booking.reader.id,
                type: 'SESSION_REMINDER',
                title: '🔔 Session Starting Soon',
                message: `Your session with ${booking.client.name} starts in ${minutesBefore} minute${minutesBefore !== 1 ? 's' : ''}`,
                metadata: {
                    bookingId: booking.id,
                    minutesBefore,
                    clientName: booking.client.name,
                    sessionTime: booking.scheduledDateTime,
                    actionUrl: `/sessions/${booking.id}`
                }
            });

            console.log(`Sent ${minutesBefore}m reminder for session ${booking.id}`);
        } catch (error) {
            console.error(`Failed to send ${minutesBefore}m reminder for session ${booking.id}:`, error);
        }
    }

    // Trigger notifications for session events
    async notifySessionStarted(sessionId: string) {
        try {
            const session = await db.session.findUnique({
                where: { id: sessionId },
                include: {
                    client: { select: { id: true, name: true } },
                    reader: { select: { id: true, name: true } }
                }
            });

            if (!session) return;

            // Notify client
            await NotificationService.createNotification({
                userId: session.client.id,
                type: 'SESSION_STARTED',
                title: '🎉 Session Started!',
                message: `Your session with ${session.reader.name} has begun. Enjoy your reading!`,
                metadata: {
                    sessionId,
                    readerName: session.reader.name,
                    startTime: new Date(),
                    actionUrl: `/sessions/${sessionId}`
                }
            });

            // Notify reader
            await NotificationService.createNotification({
                userId: session.reader.id,
                type: 'SESSION_STARTED',
                title: '🎉 Session Started!',
                message: `Your session with ${session.client.name} has begun. Have a great reading!`,
                metadata: {
                    sessionId,
                    clientName: session.client.name,
                    startTime: new Date(),
                    actionUrl: `/sessions/${sessionId}`
                }
            });

        } catch (error) {
            console.error('Failed to notify session started:', error);
        }
    }

    async notifySessionEnded(sessionId: string, duration?: number) {
        try {
            const session = await db.session.findUnique({
                where: { id: sessionId },
                include: {
                    client: { select: { id: true, name: true } },
                    reader: { select: { id: true, name: true } },
                    booking: { select: { id: true } }
                }
            });

            if (!session) return;

            const durationText = duration ? ` (${Math.round(duration / 60)} minutes)` : '';

            // Notify client
            await NotificationService.createNotification({
                userId: session.client.id,
                type: 'SESSION_ENDED',
                title: '✨ Session Complete',
                message: `Your session with ${session.reader.name} has ended${durationText}. Please consider leaving a review!`,
                metadata: {
                    sessionId,
                    readerName: session.reader.name,
                    duration,
                    canReview: true,
                    actionUrl: `/reviews/create?session=${sessionId}`
                }
            });

            // Notify reader
            await NotificationService.createNotification({
                userId: session.reader.id,
                type: 'SESSION_ENDED',
                title: '✨ Session Complete',
                message: `Your session with ${session.client.name} has ended${durationText}. Payment processing will begin shortly.`,
                metadata: {
                    sessionId,
                    clientName: session.client.name,
                    duration,
                    paymentPending: true
                }
            });

        } catch (error) {
            console.error('Failed to notify session ended:', error);
        }
    }

    async notifyBookingConfirmed(bookingId: string) {
        try {
            const booking = await db.sessionBooking.findUnique({
                where: { id: bookingId },
                include: {
                    client: { select: { id: true, name: true, displayName: true } },
                    reader: { select: { id: true, name: true, displayName: true } }
                }
            });

            if (!booking) return;

            const sessionDate = new Date(booking.selectedDateTime!).toLocaleDateString();
            const sessionTime = new Date(booking.selectedDateTime!).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Notify client
            await NotificationService.createNotification({
                userId: booking.client.id,
                type: 'SESSION_REMINDER',
                title: '✅ Booking Confirmed',
                message: `Your session with ${booking.reader.name || booking.reader.displayName || 'Reader'} is confirmed for ${sessionDate} at ${sessionTime}`,
                metadata: {
                    bookingId,
                    readerName: booking.reader.name,
                    sessionDate,
                    sessionTime,
                    actionUrl: `/sessions/${bookingId}`
                }
            });

            // Notify reader
            await NotificationService.createNotification({
                userId: booking.reader.id,
                type: 'SESSION_REMINDER',
                title: '📅 New Session Booked',
                message: `${booking.client.name || booking.client.displayName || 'Client'} has booked a session with you for ${sessionDate} at ${sessionTime}`,
                metadata: {
                    bookingId,
                    clientName: booking.client.name,
                    sessionDate,
                    sessionTime,
                    actionUrl: `/sessions/${bookingId}`
                }
            });

        } catch (error) {
            console.error('Failed to notify booking confirmed:', error);
        }
    }

    async notifyPaymentUpdate(userId: string, type: 'success' | 'failed', amount: number, details?: any) {
        try {
            if (type === 'success') {
                await NotificationService.createNotification({
                    userId,
                    type: 'PAYMENT_RECEIVED',
                    title: '💰 Payment Received',
                    message: `You received a payment of $${amount.toFixed(2)}`,
                    metadata: {
                        amount,
                        currency: 'USD',
                        ...details
                    }
                });
            } else {
                await NotificationService.createNotification({
                    userId,
                    type: 'PAYMENT_FAILED',
                    title: '❌ Payment Failed',
                    message: `Payment of $${amount.toFixed(2)} failed. Please check your payment method.`,
                    metadata: {
                        amount,
                        reason: details?.reason || 'Payment processing error',
                        ...details
                    }
                });
            }
        } catch (error) {
            console.error('Failed to notify payment update:', error);
        }
    }

    async notifyNewReview(readerId: string, rating: number, clientName: string, reviewId: string) {
        try {
            const stars = '⭐'.repeat(Math.min(rating, 5));

            await NotificationService.createNotification({
                userId: readerId,
                type: 'REVIEW_RECEIVED',
                title: '⭐ New Review',
                message: `${clientName} left you a ${rating}-star review! ${stars}`,
                metadata: {
                    rating,
                    clientName,
                    reviewId,
                    actionUrl: `/reviews/${reviewId}`
                }
            });
        } catch (error) {
            console.error('Failed to notify new review:', error);
        }
    }

    // System-wide notifications
    async broadcastSystemNotification(title: string, message: string, type: 'SYSTEM_UPDATE' | 'MAINTENANCE' | 'PROMOTION' = 'SYSTEM_UPDATE') {
        try {
            const activeUsers = await db.user.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true }
            });

            const notifications = activeUsers.map(user => ({
                userId: user.id,
                type,
                title,
                message,
                metadata: { isSystemWide: true }
            }));

            // Create notifications in batches to avoid overwhelming the database
            const batchSize = 50;
            for (let i = 0; i < notifications.length; i += batchSize) {
                const batch = notifications.slice(i, i + batchSize);
                await Promise.all(batch.map(notification =>
                    NotificationService.createNotification(notification)
                ));
            }

            console.log(`Broadcast system notification to ${activeUsers.length} users`);
        } catch (error) {
            console.error('Failed to broadcast system notification:', error);
        }
    }
}

export const notificationScheduler = NotificationScheduler.getInstance();
