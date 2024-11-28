import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Avatar, Surface, useTheme, ActivityIndicator, TouchableRipple } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../services/chatService';
import { Conversation } from '../types/chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthContext } from '../contexts/AuthContext';

const ConversationItem = ({ conversation, onPress }) => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const otherParticipant = conversation.participants.find(p => p.id !== user?.uid);

  return (
    <TouchableRipple onPress={onPress}>
      <Surface style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}>
        <Avatar.Image
          size={50}
          source={otherParticipant?.avatar ? { uri: otherParticipant.avatar } : require('../assets/default-avatar.png')}
        />
        <View style={styles.conversationInfo}>
          <Text variant="titleMedium" style={styles.participantName}>
            {otherParticipant?.name || 'Utilisateur'}
          </Text>
          {conversation.lastMessage && (
            <>
              <Text variant="bodyMedium" numberOfLines={1} style={styles.lastMessage}>
                {conversation.lastMessage.text}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {format(conversation.lastMessage.createdAt, 'dd MMM yyyy', { locale: fr })}
              </Text>
            </>
          )}
        </View>
      </Surface>
    </TouchableRipple>
  );
};

const ConversationsScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const userConversations = await chatService.getUserConversations(user.uid);
      setConversations(userConversations);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Aucune conversation</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  participantName: {
    fontWeight: '600',
  },
  lastMessage: {
    marginTop: 4,
    opacity: 0.7,
  },
  timestamp: {
    marginTop: 4,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});

export default ConversationsScreen;
