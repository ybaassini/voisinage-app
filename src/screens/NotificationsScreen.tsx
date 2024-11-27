import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Avatar, Surface, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const NotificationsScreen = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const notifications = [
    {
      id: '1',
      type: 'like',
      user: {
        name: 'Marie D.',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      content: 'a aimé votre annonce',
      postTitle: 'Prêt de perceuse professionnelle',
      timestamp: new Date().getTime() - 3600000, // 1 hour ago
      read: false,
    },
    {
      id: '2',
      type: 'response',
      user: {
        name: 'Pierre M.',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      content: 'a répondu à votre annonce',
      postTitle: 'Cours de guitare personnalisés',
      timestamp: new Date().getTime() - 7200000, // 2 hours ago
      read: true,
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  };

  const renderNotification = ({ item, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <Surface
        style={[
          styles.notificationCard,
          { backgroundColor: item.read ? theme.colors.surface : theme.colors.surfaceVariant }
        ]}
      >
        <View style={styles.notificationContent}>
          <Avatar.Image 
            size={50}
            source={{ uri: item.user.avatar }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.notificationText}>
              <Text style={styles.userName}>{item.user.name}</Text>
              {' '}{item.content}{' '}
              <Text style={styles.postTitle}>"{item.postTitle}"</Text>
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
              {getTimeAgo(item.timestamp)}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={item.type === 'like' ? 'heart' : 'message-reply-text'}
            size={24}
            color={item.type === 'like' ? theme.colors.error : theme.colors.primary}
            style={styles.icon}
          />
        </View>
      </Surface>
      <Divider />
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationCard: {
    padding: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
  },
  postTitle: {
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  icon: {
    marginLeft: 'auto',
  },
});

export default NotificationsScreen;
