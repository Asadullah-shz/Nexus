import { Notification, NotificationType } from '../types';

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'message',
    userId: 'i1', // Michael Rodriguez
    targetId: 'e1', // Sarah Johnson
    content: 'sent you a message about your startup',
    time: '5 minutes ago',
    unread: true
  },
  {
    id: 'n2',
    type: 'connection',
    userId: 'i2', // Jennifer Lee
    targetId: 'e1', // Sarah Johnson
    content: 'accepted your connection request',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 'n3',
    type: 'investment',
    userId: 'i1', // Michael Rodriguez
    targetId: 'e1', // Sarah Johnson
    content: 'showed interest in investing in your startup',
    time: '1 day ago',
    unread: false
  },
  {
    id: 'n4',
    type: 'document',
    userId: 'e1', // Sarah Johnson
    targetId: 'i1', // Michael Rodriguez
    content: 'uploaded a new version of the Pitch Deck',
    time: '3 days ago',
    unread: false
  }
];

export const getNotificationsForUser = (userId: string): Notification[] => {
  return notifications.filter(n => n.targetId === userId);
};
