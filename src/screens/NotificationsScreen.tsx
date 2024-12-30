import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton, ActivityIndicator, Button } from 'react-native-paper';

import { useNotificationContext } from '../providers/NotificationProvider';
import { Notification } from '../types/notification';
import { formatDate } from '../utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';

const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <Surface
        style={[
          styles.notificationItem,
          !notification.read && {
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }
        ]}
        elevation={notification.read ? 1 : 2}
      >
        <View style={styles.notificationContent}>
          <IconButton
            icon={notification.read ? '' : 'circle'}
            size={12}
            iconColor={theme.colors.primary}
            style={styles.icon}
          />
          
          <View style={styles.textContainer}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.title,
                !notification.read && { color: theme.colors.onPrimaryContainer, fontWeight: '600' }
              ]}
            >
              {notification.title}
            </Text>
            <Text 
              variant="bodyMedium"
              style={[
                styles.message,
                !notification.read && { color: theme.colors.onPrimaryContainer }
              ]}
            >
              {notification.message}
            </Text>
            <Text 
              variant="bodySmall" 
              style={[
                styles.timestamp,
                { color: notification.read ? theme.colors.outline : theme.colors.onPrimaryContainer }
              ]}
            >
              {formatDate(notification.createdAt, 'PPp')}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationContext();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigation logic based on notification type
    if (notification.data?.type === 'message') {
      navigation.navigate('Chat', {
        conversationId: notification.data.conversationId,
        otherParticipant: notification.data.sender
      });
    } else if (notification.data?.type === 'post') {
      navigation.navigate('PostDetail', {
        postId: notification.data.postId
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.uid);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <Button
          mode="text"
          onPress={handleMarkAllAsRead}
          style={styles.markAllButton}
        >
          Tout marquer comme lu
        </Button>
      )}
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucune notification
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  notificationItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 }
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12
  },
  icon: {
    margin: 0,
    marginRight: 8
  },
  textContainer: {
    flex: 1
  },
  title: {
    marginBottom: 4
  },
  message: {
    marginBottom: 4
  },
  timestamp: {
    opacity: 0.7
  },
  listContent: {
    paddingVertical: 8
  },
  markAllButton: {
    marginHorizontal: 16,
    marginBottom: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant
  }
});

export default NotificationsScreen;
