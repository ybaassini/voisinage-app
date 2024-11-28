import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, useTheme, Avatar, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatContext } from '../contexts/ChatContext';
import { Conversation } from '../types/chat';
import { useAuthContext } from '../contexts/AuthContext';

type RootStackParamList = {
  Chat: { conversationId: string; title: string };
};

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ConversationItem: React.FC<{
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}> = ({ conversation, currentUserId, onPress }) => {
  const theme = useTheme();
  
  // Trouver l'autre participant (pour les conversations à 2)
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  
  // Vérifier si le dernier message est de l'utilisateur courant
  const isLastMessageFromCurrentUser = conversation.lastMessage?.senderId === currentUserId;

  return (
    <Surface
      style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
      elevation={1}
    >
      <View style={styles.conversationContent}>
        <Avatar.Image
          size={50}
          source={{ uri: otherParticipant?.avatar || 'https://via.placeholder.com/50' }}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" numberOfLines={1}>
            {otherParticipant?.name || 'Utilisateur'}
          </Text>
          {conversation.lastMessage && (
            <>
              <Text
                variant="bodyMedium"
                numberOfLines={1}
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {isLastMessageFromCurrentUser ? 'Vous : ' : ''}{conversation.lastMessage.text}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.outline }}
              >
                {format(conversation.lastMessage.createdAt, 'PPp', { locale: fr })}
              </Text>
            </>
          )}
        </View>
        <IconButton
          icon="chevron-right"
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </View>
    </Surface>
  );
};

const MessagesScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { user } = useAuthContext();
  const {
    conversations,
    loading,
    error,
    refreshConversations,
  } = useChatContext();

  const handleConversationPress = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(p => p.id !== user?.uid);
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      title: otherParticipant?.name || 'Chat'
    });
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
        <Button mode="contained" onPress={refreshConversations}>
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            currentUserId={user?.uid || ''}
            onPress={() => handleConversationPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshConversations}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Aucune conversation</Text>
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
  conversationItem: {
    borderRadius: 8,
    marginBottom: 8,
  },
  conversationContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});

export default MessagesScreen;
