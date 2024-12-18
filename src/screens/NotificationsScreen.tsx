import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton, ActivityIndicator, Button } from 'react-native-paper';

import { useNotificationContext } from '../providers/NotificationProvider';
import { Notification } from '../types/notification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';

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
              {format(notification.createdAt, 'PPp', { locale: fr })}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    notifications,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount
  } = useNotificationContext();

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigation basée sur le type de notification
    switch (notification.type) {
      case 'request':
        if (notification.data?.postId) {
          navigation.navigate('PostDetail', {
            postId: notification.data.postId
          });
        }
        break;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
    <View style={[styles.container, styles.centerContent]}>
      <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
        {error}
      </Text>
      <Button mode="contained" onPress={refreshNotifications}>
        Réessayer
      </Button>
    </View>
  );
}

  if (!notifications.length) {
    return (
      <View style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <IconButton
            icon="bell-outline"
            size={48}
            iconColor={theme.colors.onSurfaceVariant}
          />
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
          >
            Aucune notification pour le moment
          </Text>
          <Button 
            mode="text" 
            onPress={refreshNotifications}
            style={{ marginTop: 16 }}
          >
            Actualiser
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    
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
            refreshing={loading}
            onRefresh={refreshNotifications}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
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
  }
});

export default NotificationsScreen;
