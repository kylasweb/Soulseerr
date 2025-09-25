import { notificationScheduler } from '@/lib/notification-scheduler';

let isSchedulerRunning = false;

export function initializeNotificationScheduler() {
    if (!isSchedulerRunning) {
        notificationScheduler.startReminderService(5); // Check every 5 minutes
        isSchedulerRunning = true;
        console.log('Notification scheduler initialized');
    }
}

// Auto-initialize on server start
if (typeof window === 'undefined') {
    setTimeout(() => {
        initializeNotificationScheduler();
    }, 1000);
}