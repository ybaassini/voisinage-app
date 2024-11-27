import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Avatar, Surface, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MessagesScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const messages = [
    {
      id: '1',
      user: {
        name: 'Marie D.',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        online: true,
      },
      lastMessage: 'Bonjour, est-ce que la perceuse est toujours disponible ?',
      timestamp: new Date().getTime() - 1800000, // 30 minutes ago
      unread: true,
      postTitle: 'Prêt de perceuse professionnelle',
    },
    {
      id: '2',
      user: {
        name: 'Pierre M.',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        online: false,
      },
      lastMessage: 'Merci pour votre réponse, je suis disponible demain',
      timestamp: new Date().getTime() - 7200000, // 2 hours ago
      unread: false,
      postTitle: 'Cours de guitare personnalisés',
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

  const renderMessage = ({ item, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat')}
      >
        <Surface
          style={[
            styles.messageCard,
            {
              backgroundColor: theme.colors.surface,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }
          ]}
        >
          <View style={styles.messageContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={56}
                source={{ uri: item.user.avatar }}
              />
              {item.user.online && (
                <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>

            <View style={styles.textContainer}>
              <View style={styles.messageHeader}>
                <Text style={[styles.userName, item.unread && styles.unreadText]}>
                  {item.user.name}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                  {getTimeAgo(item.timestamp)}
                </Text>
              </View>

              <Text 
                style={[
                  styles.lastMessage,
                  item.unread && styles.unreadText,
                  { color: item.unread ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
                ]}
                numberOfLines={2}
              >
                {item.lastMessage}
              </Text>

              <Text style={[styles.postTitle, { color: theme.colors.primary }]}>
                {item.postTitle}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={styles.chevron}
            />
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  list: {
    padding: 16,
  },
  messageCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadText: {
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
});

export default MessagesScreen;
