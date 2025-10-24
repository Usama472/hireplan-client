import { useState, useEffect, useCallback } from 'react';
import API from '@/http';

export interface MessageNotification {
  _id: string;
  type: 'NEW_MESSAGE';
  userId: string;
  companyId: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedConversationId?: string;
  relatedApplicantId?: string;
  metadata?: {
    senderName?: string;
    messagePreview?: string;
    messageCount?: number;
    lastMessageAt?: string;
  };
  createdAt: string;
}

export interface ExpiredJobNotification {
  _id: string;
  type: 'JOB_EXPIRED';
  userId: string;
  companyId: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedJobId?: string;
  metadata?: {
    jobTitle?: string;
    endDate?: string;
  };
  createdAt: string;
}

export type Notification = MessageNotification | ExpiredJobNotification;

interface UseNotificationsReturn {
  messageNotifications: MessageNotification[];
  expiredJobNotifications: ExpiredJobNotification[];
  allNotifications: Notification[];
  loading: boolean;
  refetch: () => Promise<void>;
  totalCount: number;
  messageCount: number;
  jobCount: number;
}

export function useNotifications(): UseNotificationsReturn {
  const [messageNotifications, setMessageNotifications] = useState<MessageNotification[]>([]);
  const [expiredJobNotifications, setExpiredJobNotifications] = useState<ExpiredJobNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [messages, jobs] = await Promise.all([
        API.notification.getMessageNotifications(),
        API.notification.getExpiredJobNotifications()
      ]);
      
      setMessageNotifications(messages.data.notifications);
      setExpiredJobNotifications(jobs.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const allNotifications = [...messageNotifications, ...expiredJobNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    messageNotifications,
    expiredJobNotifications,
    allNotifications,
    loading,
    refetch: fetchNotifications,
    totalCount: messageNotifications.length + expiredJobNotifications.length,
    messageCount: messageNotifications.length,
    jobCount: expiredJobNotifications.length
  };
}

