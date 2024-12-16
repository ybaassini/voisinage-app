import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';
import { notificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { userProfile } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Sauvegarder le token dans AsyncStorage
        AsyncStorage.setItem('pushToken', token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      updateBadgeCount();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const updateBadgeCount = async () => {
    if (!userProfile) return;
    
    try {
      const notifications = await notificationService.getUserNotifications(userProfile.id);
      const unreadCount = notifications.filter(n => !n.read).length;
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du badge:', error);
    }
  };

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Marquer la notification comme lue
    if (data.notificationId) {
      await notificationService.markAsRead(data.notificationId);
      updateBadgeCount();
    }

    // Navigation basée sur le type de notification
    if (data.type === 'message' && data.chatId) {
      // Navigation vers le chat
      // navigation.navigate('Chat', { chatId: data.chatId });
    } else if (data.type === 'request' && data.postId) {
      // Navigation vers le détail du post
      // navigation.navigate('PostDetail', { postId: data.postId });
    }
  };

  const sendPushNotification = async (expoPushToken: string, title: string, body: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  return {
    expoPushToken,
    notification,
    sendPushNotification,
    updateBadgeCount,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  
  return token;
}
