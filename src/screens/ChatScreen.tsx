import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chatService } from '../services/chatService';
import { Message } from '../types/chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthContext } from '../contexts/AuthContext';

const MessageBubble = ({ message, isOwnMessage }) => {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInUp}
      style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        {
          backgroundColor: isOwnMessage
            ? theme.colors.primaryContainer
            : theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text style={[
        styles.messageText,
        { color: isOwnMessage ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
      ]}>
        {message.text}
      </Text>
      <Text style={[styles.messageTime, { color: isOwnMessage ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }]}>
        {format(message.createdAt, 'HH:mm', { locale: fr })}
      </Text>
    </Animated.View>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const flatListRef = useRef(null);
  const { user } = useAuthContext();
  
  const { conversationId } = route.params;

  useEffect(() => {
    if (!user) return;
    loadMessages();
    const unsubscribe = chatService.subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      chatService.markMessagesAsRead(conversationId, user.uid);
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const conversationMessages = await chatService.getConversationMessages(conversationId);
      setMessages(conversationMessages);
      chatService.markMessagesAsRead(conversationId, user.uid);
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError('Impossible de charger les messages. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      await chatService.sendMessage({
        conversationId,
        senderId: user.uid,
        text: newMessage.trim(),
        read: false
      });
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Impossible d\'envoyer le message. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === user.uid}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Aucun message</Text>
          </View>
        )}
      />

      <Surface style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          mode="outlined"
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Votre message..."
          style={styles.input}
          multiline
          maxLength={500}
          disabled={sending}
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
          style={styles.sendButton}
        />
      </Surface>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});

export default ChatScreen;
