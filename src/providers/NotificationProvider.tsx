import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  sendNotification: (userId: string, title: string, message: string, data?: any) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
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
  const { userProfile } = useAuth();

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
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async (userId: string) => {
    await notificationService.markAllAsRead(userId);
  };

  const value = {
    sendNotification,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
