import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, useTheme, Divider, Badge, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../services/chatService';
import { Conversation } from '../types/chat';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { fr, th } from 'date-fns/locale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const ConversationItem = ({ conversation, currentUserId, onPress }) => {
  const theme = useTheme();
  const recipient = conversation.participants.find(p => p.id !== currentUserId);
  const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;
  console.log('recipient', recipient);
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.conversationItem}>
      <Avatar.Text
        size={50}
        label={recipient?.name?.charAt(0).toUpperCase() || '?'}
        style={{ backgroundColor: theme.colors.primary }}
      />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.participantName}>
            {recipient?.name || 'Utilisateur'}
          </Text>
          {conversation.lastMessage && (
            <Text variant="bodySmall" style={styles.timestamp}>
              {format(conversation.lastMessage.createdAt, 'dd MMM HH:mm', { locale: fr })}
            </Text>
          )}
        </View>
        
        <View style={styles.lastMessageContainer}>
          {conversation.lastMessage ? (
            <Text
              variant="bodyMedium"
              numberOfLines={1}
              style={[
                styles.lastMessage,
                unreadCount > 0 && { fontWeight: 'bold', color: theme.colors.primary }
              ]}
            >
              {conversation.lastMessage.text}
            </Text>
          ) : (
            <Text variant="bodyMedium" style={styles.noMessages}>
              Aucun message
            </Text>
          )}
          
          {unreadCount > 0 && (
            <Badge size={24} style={styles.unreadBadge}>
              {unreadCount}
            </Badge>
          )}
          
          {conversation.postId && (
            <MaterialCommunityIcons
              name="post-outline"
              size={16}
              color={theme.colors.primary}
              style={styles.postIcon}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const navigation = useNavigation();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    let conversationsUnsubscribe: (() => void) | undefined;
    let unreadCountUnsubscribe: (() => void) | undefined;

    if (user) {
      // S'abonner aux conversations
      conversationsUnsubscribe = chatService.subscribeToConversations(user.uid, (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      });

      // S'abonner au nombre total de messages non lus
      unreadCountUnsubscribe = chatService.subscribeToTotalUnreadCount(user.uid, (count) => {
        setTotalUnread(count);
      });
    }

    return () => {
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
      }
      if (unreadCountUnsubscribe) {
        unreadCountUnsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    // Mettre à jour le badge de l'onglet avec le nombre total de messages non lus
    navigation.setOptions({
      tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
    });
  }, [totalUnread, navigation]);

  const handleConversationPress = (conversation: Conversation) => {
    const recipient = conversation.participants.find(p => p.id !== user?.uid);
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      recipientAvatar: recipient?.avatar,
      recipientName: recipient?.name,
      recipientId: recipient?.id,
      postId: conversation.postId,

    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!conversations.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium">Aucune conversation</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Commencez une conversation en répondant à une annonce
        </Text>
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
            currentUserId={user?.uid}
            onPress={() => handleConversationPress(item)}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  list: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.surface,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    borderWidth:0
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
  participantName: {
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    opacity: 0.7,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    marginRight: 8,
  },
  noMessages: {
    opacity: 0.5,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  postIcon: {
    marginLeft: 8,
  },
});
