import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, data?: any) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { expoPushToken, updateBadgeCount } = useNotifications();
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedNotifications = await notificationService.getUserNotifications(user.uid);
      setNotifications(fetchedNotifications);
      const unreadNotifications = fetchedNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadNotifications);
      await updateBadgeCount();
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const sendNotification = async (userId: string, title: string, message: string, data?: any) => {
    try {
      await notificationService.createNotification({
        userId,
        title,
        message,
        data
      });
      await loadNotifications();
    } catch (err) {
      console.error('Error sending notification:', err);
      throw err;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      const newUnreadCount = unreadCount - 1;
      setUnreadCount(newUnreadCount);
      await updateBadgeCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      await updateBadgeCount();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userProfile?.id && expoPushToken) {
      notificationService.savePushToken(userProfile.id, expoPushToken);
    }
  }, [userProfile?.id, expoPushToken]);

  useEffect(() => {
    if (userProfile?.id) {
      updateBadgeCount();
    }
  }, [userProfile?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        unreadCount,
        loadNotifications,
        sendNotification,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
