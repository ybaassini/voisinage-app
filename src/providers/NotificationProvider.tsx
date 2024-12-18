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

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedNotifications = await notificationService.getUserNotifications(user.uid);
      setNotifications(fetchedNotifications);
      const unreadNotifications = fetchedNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

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

  const sendNotification = async (userId: string, title: string, message: string, data?: any) => {
    await notificationService.createNotification({
      userId,
      type: data?.type || 'system',
      title,
      message,
      data
    });
    if (userId === user?.uid) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async (userId: string) => {
    await notificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    sendNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
