import { get, patch, del } from '../apiHelper';

export const getNotifications = async (params?: { type?: string; status?: string; page?: number; limit?: number }) => 
  get('/notifications', params);

export const getUnreadCount = async () => 
  get('/notifications/unread-count');

export const getExpiredJobNotifications = async () => 
  get('/notifications/expired-jobs');

export const getMessageNotifications = async () => 
  get('/notifications/messages');

export const markAsRead = async (notificationId: string) => 
  patch(`/notifications/${notificationId}/read`, {});

export const dismissNotification = async (notificationId: string) => 
  patch(`/notifications/${notificationId}/dismiss`, {});

export const dismissConversationNotifications = async (conversationId: string) => 
  patch(`/notifications/conversation/${conversationId}/dismiss`, {});

export const deleteNotification = async (notificationId: string) => 
  del(`/notifications/${notificationId}`);

export const markAllAsRead = async () => 
  patch('/notifications/mark-all-read', {});

