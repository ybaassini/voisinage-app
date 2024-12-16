import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Avatar, useTheme, Divider, Badge, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../services/chatService';
import { Conversation } from '../types/chat';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { userService } from '../services/userService';

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
                {format(conversation.lastMessage.createdAt, 'HH:mm', { locale: fr })}
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const { user, userProfile } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();

  useEffect(() => {
    let conversationsUnsubscribe: (() => void) | undefined;
    let unreadCountUnsubscribe: (() => void) | undefined;

    if (user && userProfile) {
      console.log('👤 Utilisateur connecté:', user.uid);
      console.log('👤 Profil utilisateur:', userProfile);
      
      if (!userProfile.displayName) {
        console.error('Le profil utilisateur n\'a pas de displayName');
        setLoading(false);
        return;
      }
      
      // S'abonner aux conversations
      conversationsUnsubscribe = chatService.subscribeToConversations(
        user.uid,
        userProfile.displayName,
        (newConversations) => {
          console.log(`📱 ConversationsScreen: Réception de ${newConversations.length} conversations`);
          console.log('📱 Conversations:', JSON.stringify(newConversations, null, 2));
          // Set conversations immediately without avatars
          setConversations(newConversations);
          setLoading(false);
          setRefreshing(false);

          // Load avatars in the background
          newConversations.forEach(conversation => {
            conversation.participants.forEach(participant => {
              if (participant.id !== user.uid) {
                userService.getUserAvatar(participant.id)
                  .then(avatarUrl => {
                    if (avatarUrl) {
                      setConversations(prevConversations => 
                        prevConversations.map(conv => {
                          if (conv.id === conversation.id) {
                            return {
                              ...conv,
                              participants: conv.participants.map(p => 
                                p.id === participant.id ? { ...p, avatar: avatarUrl } : p
                              )
                            };
                          }
                          return conv;
                        })
                      );
                    }
                  })
                  .catch(error => {
                    console.error(`Erreur lors du chargement de l'avatar pour ${participant.id}:`, error);
                  });
              }
            });
          });
        }
      );

      // S'abonner au nombre total de messages non lus
      unreadCountUnsubscribe = chatService.subscribeToTotalUnreadCount(user.uid, (count) => {
        console.log('🔢 Mise à jour du nombre total de messages non lus:', count);
        setTotalUnread(count);
      });
    } else {
      console.log('⚠️ Aucun utilisateur connecté ou profil non chargé');
      setLoading(false);
    }

    return () => {
      console.log('🧹 Nettoyage des abonnements');
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
      }
      if (unreadCountUnsubscribe) {
        unreadCountUnsubscribe();
      }
    };
  }, [user, userProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Le rafraîchissement sera géré par le callback de subscribeToConversations
  };

  const renderItem = ({ item: conversation }: { item: Conversation }) => {
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== user?.uid
    );

    const displayName = otherParticipant?.displayName || 'Utilisateur';
    const avatarLabel = displayName.substring(0, 2).toUpperCase();

    return (
      <ConversationItem
        conversation={conversation}
        currentUserId={user?.uid || ''}
        onPress={() => {
          if (otherParticipant) {
            navigation.navigate('Chat', {
              conversationId: conversation.id,
              recipient: {
                id: otherParticipant.id,
                displayName: otherParticipant.displayName || 'Utilisateur',
                avatar: otherParticipant.avatar
              },
              postId: conversation.postId
            });
          }
        }}
      />
    );
  };

  if (loading) {
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
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Aucune conversation</Text>
          </View>
        }
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
});

export default ConversationsScreen;
