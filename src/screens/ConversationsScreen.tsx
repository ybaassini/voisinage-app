import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Avatar, useTheme, Divider, Badge, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Conversation } from '../types/chat';
import { useAuth } from '../hooks/useAuth';
import { fr } from 'date-fns/locale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { userService } from '../services/userService';
import { useChatContext } from '../contexts/ChatContext';
import { Timestamp } from 'firebase/firestore';
import { formatDate } from '../utils/dateUtils';
import { UserProfile } from '../types/user';

const ConversationItem = ({
  conversation,
  currentUserId,
  onPress,
}: {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}) => {
  const theme = useTheme();
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  if (!otherParticipant) {
    console.warn('Participant non trouvé dans la conversation:', conversation.id);
    return null;
  }

  const displayName = otherParticipant.displayName || 'Utilisateur';
  const avatarLabel = displayName.substring(0, 2).toUpperCase();

  return (
    <TouchableOpacity onPress={onPress} style={styles.conversationItem}>
      <View style={styles.conversationContent}>
        {otherParticipant.avatar ? (
          <Avatar.Image
            size={50}
            source={{ uri: otherParticipant.avatar }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={50}
            label={avatarLabel}
            style={styles.avatar}
          />
        )}
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text variant="titleMedium">{displayName}</Text>
            {conversation.lastMessage && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {formatDate(
                  conversation.lastMessage.createdAt,
                  'HH:mm'
                )}
              </Text>
            )}
          </View>
          {conversation.lastMessage && (
            <Text
              variant="bodyMedium"
              numberOfLines={1}
              style={{
                color: conversation.unreadCount > 0 ? theme.colors.onSurface : theme.colors.outline,
                fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
              }}
            >
              {conversation.lastMessage.text}
            </Text>
          )}
        </View>
      </View>
      {conversation.unreadCount > 0 && (
        <Badge style={styles.unreadBadge}>{conversation.unreadCount}</Badge>
      )}
      {conversation.postId && (
        <MaterialCommunityIcons
          name="post-outline"
          size={16}
          color={theme.colors.primary}
          style={styles.postIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const ConversationsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const { user, userProfile } = useAuth();
  const { conversations, loading, loadConversations, refreshConversations } = useChatContext();
  const navigation = useNavigation();
  const theme = useTheme();

  useEffect(() => {
    if (user && userProfile) {
      loadConversations();
    }
  }, [user, userProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  };

  const navigateToChat = (conversationId: string, otherParticipant: UserProfile, postId?: string) => {
    navigation.navigate('Chat', {
      conversationId,
      postId,
      recipient:otherParticipant
    });
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
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            currentUserId={user?.uid || ''}
            onPress={() => {
              const otherParticipant = item.participants.find(
                (p) => p.id !== user?.uid
              ) as UserProfile;
              if (otherParticipant) {
                navigateToChat(item.id, otherParticipant, item.postId);
              }
            }}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucune conversation pour le moment
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    borderWidth: 0,
  },
  conversationContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  postIcon: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    marginRight: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.outline,
  },
});

export default ConversationsScreen;
