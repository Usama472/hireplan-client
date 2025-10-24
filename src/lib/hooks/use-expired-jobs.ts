import { useState, useEffect } from 'react';
import API from '@/http';

interface ExpiredJobNotification {
  id: string;
  relatedJobId: {
    id: string;
    jobTitle: string;
    jobBoardTitle: string;
    endDate: string;
    status: string;
  };
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

export function useExpiredJobs() {
  const [notifications, setNotifications] = useState<ExpiredJobNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExpiredJobs = async () => {
    try {
      setLoading(true);
      const response = await API.notification.getExpiredJobNotifications();
      
      if (response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching expired job notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredJobs();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchExpiredJobs, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    refetch: fetchExpiredJobs,
    count: notifications.length
  };
}

