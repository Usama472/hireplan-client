import { useState, useEffect } from 'react';
import API from '@/http';

export function useApplicantNotifications() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await API.applicantAuth.getUnreadCount();
      
      if (response.data) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount
  };
}

