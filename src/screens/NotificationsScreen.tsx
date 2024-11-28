import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, useTheme, IconButton, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationContext } from '../contexts/NotificationContext';
import { Notification } from '../types/notification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  const theme = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return 'message';
      case 'request':
        return 'account-clock';
      case 'service':
        return 'handshake';
      default:
        return 'bell';
    }
  };

  return (
    <Surface
      style={[
        styles.notificationItem,
        { backgroundColor: notification.read ? theme.colors.surface : theme.colors.surfaceVariant }
      ]}
    >
      <View style={styles.notificationContent}>
        <IconButton
          icon={getIcon(notification.type)}
          size={24}
          iconColor={theme.colors.primary}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium">{notification.title}</Text>
          <Text variant="bodyMedium">{notification.message}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {format(notification.createdAt, 'PPp', { locale: fr })}
          </Text>
        </View>
      </View>
    </Surface>
  );
};

const NotificationsScreen = () => {
  const theme = useTheme();
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
    // Gérer la navigation en fonction du type de notification
    // TODO: Implémenter la navigation
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {unreadCount > 0 && (
        <Button
          mode="contained-tonal"
          onPress={markAllAsRead}
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
            refreshing={loading}
            onRefresh={refreshNotifications}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Aucune notification</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  markAllButton: {
    margin: 16,
    marginBottom: 0,
  },
});

export default NotificationsScreen;
