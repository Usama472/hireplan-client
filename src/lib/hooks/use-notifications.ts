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

export interface NewApplicationNotification {
  _id: string;
  type: 'NEW_APPLICATION';
  userId: string;
  companyId: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedJobId?: string;
  relatedApplicantId?: string;
  metadata?: {
    applicantEmail?: string;
    jobTitle?: string;
  };
  createdAt: string;
}

export type Notification = MessageNotification | ExpiredJobNotification | NewApplicationNotification;

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
      const [messages, jobs, general] = await Promise.all([
        API.notification.getMessageNotifications(),
        API.notification.getExpiredJobNotifications(),
        API.notification.getNotifications({ status: 'unread', limit: 100 })
      ]);
      
      // Handle potential undefined responses
      const messagesData = messages?.data?.notifications || [];
      const jobsData = jobs?.data?.notifications || [];
      const generalData = general?.results || general?.data?.results || [];
      
      console.log('📬 Notifications fetched:', {
        messages: messagesData.length,
        jobs: jobsData.length,
        general: generalData.length
      });
      
      setMessageNotifications(messagesData);
      setExpiredJobNotifications(jobsData);
      
      // Merge all notifications, avoiding duplicates
      const allIds = new Set([
        ...messagesData.map((n: any) => n._id),
        ...jobsData.map((n: any) => n._id)
      ]);
      
      const uniqueGeneralNotifications = generalData.filter((n: any) => !allIds.has(n._id));
      
      // Store general notifications in message notifications array for now
      // (they'll be displayed together)
      if (uniqueGeneralNotifications.length > 0) {
        setMessageNotifications([...messagesData, ...uniqueGeneralNotifications]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set empty arrays on error to prevent undefined state
      setMessageNotifications([]);
      setExpiredJobNotifications([]);
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

