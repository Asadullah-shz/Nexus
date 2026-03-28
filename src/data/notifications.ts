import { AppNotification } from '../types';

const STORAGE_KEY = 'nexus_notifications';

const initialAppNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'message',
    userId: 'i1',
    targetId: 'e1',
    content: 'sent you a message about your startup',
    time: '5 minutes ago',
    unread: true
  },
  {
    id: 'n2',
    type: 'connection',
    userId: 'i2',
    targetId: 'e1',
    content: 'accepted your connection request',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 'n3',
    type: 'investment',
    userId: 'i1',
    targetId: 'e1',
    content: 'showed interest in investing in your startup',
    time: '1 day ago',
    unread: false
  },
  {
    id: 'n4',
    type: 'document',
    userId: 'e1',
    targetId: 'i1',
    content: 'uploaded a new version of the Pitch Deck',
    time: '3 days ago',
    unread: false
  }
];

const getStoredAppNotifications = (): AppNotification[] => {
  if (typeof window === 'undefined') return initialAppNotifications;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialAppNotifications;
};

export let notifications: AppNotification[] = getStoredAppNotifications();

const saveAppNotifications = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
};

export const getAppNotificationsForUser = (userId: string): AppNotification[] => {
  return notifications.filter(n => n.targetId === userId);
};

export const markAppNotificationsAsRead = (userId: string) => {
  let changed = false;
  notifications = notifications.map(n => {
    if (n.targetId === userId && n.unread) {
      changed = true;
      return { ...n, unread: false };
    }
    return n;
  });
  
  if (changed) saveAppNotifications();
};

export const addAppNotification = (notif: Omit<AppNotification, 'id' | 'time' | 'unread'>) => {
  const newNotif: AppNotification = {
    ...notif,
    id: `n${Date.now()}`,
    time: 'Just now',
    unread: true
  };
  notifications.unshift(newNotif);
  saveAppNotifications();
};

export type { AppNotification };