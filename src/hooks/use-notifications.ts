import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './use-socket';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    userId: string;
    type: 'SESSION_REMINDER' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'REVIEW_RECEIVED' | 'SYSTEM_UPDATE' | 'MAINTENANCE' | 'PROMOTION';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface NotificationFilters {
    type?: Notification['type'][];
    read?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
    applyFilters: (filters: NotificationFilters) => void;
    filteredNotifications: Notification[];
    hasMore: boolean;
    loadMore: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<NotificationFilters>({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { socket } = useSocket();

    const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20'
            });

            if (filters.type?.length) {
                params.append('type', filters.type.join(','));
            }
            if (filters.read !== undefined) {
                params.append('read', filters.read.toString());
            }
            if (filters.dateFrom) {
                params.append('dateFrom', filters.dateFrom.toISOString());
            }
            if (filters.dateTo) {
                params.append('dateTo', filters.dateTo.toISOString());
            }

            const response = await fetch(`/api/notifications?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();

            setNotifications(prev => append ? [...prev, ...data.notifications] : data.notifications);
            setUnreadCount(data.unreadCount);
            setHasMore(data.hasMore);

            if (pageNum === 1) {
                setPage(1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const applyFiltersToNotifications = useCallback(() => {
        let filtered = [...notifications];

        if (filters.type?.length) {
            filtered = filtered.filter(notif => filters.type!.includes(notif.type));
        }

        if (filters.read !== undefined) {
            filtered = filtered.filter(notif => notif.read === filters.read);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(notif => new Date(notif.createdAt) >= filters.dateFrom!);
        }

        if (filters.dateTo) {
            filtered = filtered.filter(notif => new Date(notif.createdAt) <= filters.dateTo!);
        }

        setFilteredNotifications(filtered);
    }, [notifications, filters]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Optimistically update the UI
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            toast.error('Failed to mark notification as read');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH'
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            // Update all notifications to read
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );

            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            toast.error('Failed to mark all notifications as read');
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Remove from UI
            const deletedNotif = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            toast.success('Notification deleted');
        } catch (err) {
            console.error('Error deleting notification:', err);
            toast.error('Failed to delete notification');
        }
    }, [notifications]);

    const clearAll = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to clear all notifications');
            }

            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications cleared');
        } catch (err) {
            console.error('Error clearing all notifications:', err);
            toast.error('Failed to clear all notifications');
        }
    }, []);

    const refresh = useCallback(async () => {
        await fetchNotifications(1, false);
    }, [fetchNotifications]);

    const loadMore = useCallback(async () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            await fetchNotifications(nextPage, true);
            setPage(nextPage);
        }
    }, [hasMore, loading, page, fetchNotifications]);

    const applyFilters = useCallback((newFilters: NotificationFilters) => {
        setFilters(newFilters);
        setPage(1);
        // fetchNotifications will be called by the useEffect when filters change
    }, []);

    // Initial load
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Apply client-side filters
    useEffect(() => {
        applyFiltersToNotifications();
    }, [applyFiltersToNotifications]);

    // Real-time updates via socket
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for important notifications
            if (['SESSION_REMINDER', 'SESSION_STARTED', 'PAYMENT_RECEIVED'].includes(notification.type)) {
                toast(notification.title, {
                    description: notification.message,
                    action: notification.metadata?.actionUrl ? {
                        label: 'View',
                        onClick: () => window.location.href = notification.metadata!.actionUrl
                    } : undefined
                });
            }
        };

        const handleNotificationRead = (data: { notificationId: string }) => {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === data.notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        };

        const handleNotificationDeleted = (data: { notificationId: string }) => {
            const deletedNotif = notifications.find(n => n.id === data.notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== data.notificationId));

            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        };

        socket!.on('notification:new', handleNewNotification);
        socket!.on('notification:read', handleNotificationRead);
        socket!.on('notification:deleted', handleNotificationDeleted);

        return () => {
            socket!.off('notification:new', handleNewNotification);
            socket!.off('notification:read', handleNotificationRead);
            socket!.off('notification:deleted', handleNotificationDeleted);
        };
    }, [socket, notifications]);

    return {
        notifications,
        filteredNotifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refresh,
        applyFilters,
        hasMore,
        loadMore
    };
}