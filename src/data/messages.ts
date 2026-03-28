import { Message, ChatConversation } from '../types';

const STORAGE_KEY = 'nexus_messages';

const initialMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'e1',
    receiverId: 'i1',
    content: 'Thanks for connecting. Id love to discuss how our Nexus platform can revolutionize financial analytics for SMBs.',
    timestamp: '2023-08-15T10:15:00Z',
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'i1',
    receiverId: 'e1',
    content: 'Im interested in learning more about your tech stack and ML models. Are you available for a call this week?',
    timestamp: '2023-08-15T10:30:00Z',
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'e1',
    receiverId: 'i1',
    content: 'Absolutely! I can walk you through our technology and current traction. How does Thursday at 2pm PT work?',
    timestamp: '2023-08-15T10:45:00Z',
    isRead: true
  },
  {
    id: 'm4',
    senderId: 'i1',
    receiverId: 'e1',
    content: 'Thursday works great. Ill send a calendar invite. Looking forward to it!',
    timestamp: '2023-08-15T11:00:00Z',
    isRead: false
  }
];

const getStoredMessages = (): Message[] => {
  if (typeof window === 'undefined') return initialMessages;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialMessages;
};

export let messages: Message[] = getStoredMessages();

const saveMessages = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }
};

export const getMessagesBetweenUsers = (user1Id: string, user2Id: string): Message[] => {
  return messages.filter(
    message => 
      (message.senderId === user1Id && message.receiverId === user2Id) || 
      (message.senderId === user2Id && message.receiverId === user1Id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getConversationsForUser = (userId: string): ChatConversation[] => {
  const conversationPartners = new Set<string>();
  
  messages.forEach(message => {
    if (message.senderId === userId) {
      conversationPartners.add(message.receiverId);
    }
    if (message.receiverId === userId) {
      conversationPartners.add(message.senderId);
    }
  });

  return Array.from(conversationPartners).map(partnerId => {
    const conversationMessages = getMessagesBetweenUsers(userId, partnerId);
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    return {
      id: `conv-${userId}-${partnerId}`,
      participants: [userId, partnerId],
      lastMessage,
      updatedAt: lastMessage?.timestamp || new Date().toISOString()
    };
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const sendMessage = (newMessage: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Message => {
  const message: Message = {
    ...newMessage,
    id: `m${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  messages.push(message);
  saveMessages();
  return message;
};

export const markMessagesAsRead = (user1Id: string, user2Id: string) => {
  let changed = false;
  messages = messages.map(m => {
    if (m.senderId === user2Id && m.receiverId === user1Id && !m.isRead) {
      changed = true;
      return { ...m, isRead: true };
    }
    return m;
  });
  
  if (changed) saveMessages();
};