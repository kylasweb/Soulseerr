import { db } from '@/lib/db'
import { io } from '@/lib/socket'

export type NotificationType = 'SESSION_REMINDER' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'REVIEW_RECEIVED' | 'NEW_MESSAGE' | 'SYSTEM_UPDATE' | 'MAINTENANCE' | 'PROMOTION'

interface CreateNotificationData {
    userId: string
    title: string
    message: string
    type: NotificationType
    metadata?: any
}

export class NotificationService {
    static async createNotification(data: CreateNotificationData) {
        try {
            const notification = await db.notification.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    metadata: data.metadata,
                },
            })

            // Send real-time notification
            io.to(data.userId).emit('notification', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                metadata: notification.metadata,
                createdAt: notification.createdAt,
            })

            // Update unread count
            const unreadCount = await db.notification.count({
                where: {
                    userId: data.userId,
                    isRead: false,
                }
            })

            io.to(data.userId).emit('unread-count-updated', { unreadCount })

            return notification
        } catch (error) {
            console.error('Failed to create notification:', error)
            throw error
        }
    }

    // Session-related notifications
    static async notifySessionReminder(sessionId: string) {
        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: {
                client: { select: { id: true, username: true } },
                reader: {
                    select: {
                        id: true,
                        username: true,
                        readerProfile: { select: { firstName: true, lastName: true } }
                    }
                },
            }
        })

        if (!session) return

        const readerName = session.reader.readerProfile
            ? `${session.reader.readerProfile.firstName} ${session.reader.readerProfile.lastName}`
            : session.reader.username

        // Notify client
        await this.createNotification({
            userId: session.clientId,
            title: 'Session Reminder',
            message: `Your session with ${readerName} starts in 15 minutes`,
            type: 'SESSION_REMINDER',
        })

        // Notify reader
        await this.createNotification({
            userId: session.readerId,
            title: 'Session Reminder',
            message: `Your session with ${session.client.username} starts in 15 minutes`,
            type: 'SESSION_REMINDER',
        })
    }

    static async notifySessionCancelled(sessionId: string, cancelledBy: string) {
        const session = await db.session.findUnique({
            where: { id: sessionId },
            include: {
                client: { select: { id: true, username: true } },
                reader: {
                    select: {
                        id: true,
                        username: true,
                        readerProfile: { select: { firstName: true, lastName: true } }
                    }
                },
            }
        })

        if (!session) return

        const readerName = session.reader.readerProfile
            ? `${session.reader.readerProfile.firstName} ${session.reader.readerProfile.lastName}`
            : session.reader.username

        const targetUserId = cancelledBy === session.clientId ? session.readerId : session.clientId
        const cancellerName = cancelledBy === session.clientId ? session.client.username : readerName

        await this.createNotification({
            userId: targetUserId,
            title: 'Session Cancelled',
            message: `Your session has been cancelled by ${cancellerName}. You will receive a full refund.`,
            type: 'SESSION_ENDED', // Using available enum value
        })
    }

    static async notifyPaymentReceived(readerId: string, amount: number, sessionId: string) {
        const reader = await db.user.findUnique({
            where: { id: readerId },
            select: { username: true }
        })

        if (!reader) return

        await this.createNotification({
            userId: readerId,
            title: 'Payment Received',
            message: `You received a payment of $${amount.toFixed(2)} for your session`,
            type: 'PAYMENT_RECEIVED',
        })
    }

    static async notifyReviewReceived(readerId: string, rating: number, clientUsername: string) {
        await this.createNotification({
            userId: readerId,
            title: 'New Review Received',
            message: `${clientUsername} left you a ${rating}-star review`,
            type: 'REVIEW_RECEIVED',
        })
    }

    // System notifications
    static async notifySystemUpdate(userId: string, title: string, message: string) {
        await this.createNotification({
            userId,
            title,
            message,
            type: 'SYSTEM_UPDATE',
        })
    }

    static async broadcastSystemUpdate(title: string, message: string, excludeRole?: 'CLIENT' | 'READER' | 'ADMIN') {
        let users

        if (excludeRole) {
            users = await db.user.findMany({
                where: { role: { not: excludeRole } },
                select: { id: true }
            })
        } else {
            users = await db.user.findMany({
                select: { id: true }
            })
        }

        const notifications = users.map(user => ({
            userId: user.id,
            title,
            message,
            type: 'SYSTEM_UPDATE' as NotificationType,
        }))

        await db.notification.createMany({
            data: notifications
        })

        // Emit to all users
        io.emit('notification', {
            title,
            message,
            type: 'SYSTEM_UPDATE',
            createdAt: new Date(),
        })
    }
}