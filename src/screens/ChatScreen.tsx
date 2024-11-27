import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import {
  Text,
  Avatar,
  useTheme,
  MD3Theme,
  TextInput,
  IconButton,
  Surface,
} from 'react-native-paper';
import Animated, {
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

// Types
type Message = {
  id: string;
  text: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  senderAvatar: string;
};

// Mock data
const mockMessages: Message[] = [
  {
    id: '1',
    text: "Bonjour ! Je suis intéressé par votre annonce. Est-ce toujours d'actualité ?",
    timestamp: Date.now() - 3600000,
    senderId: '2',
    senderName: 'Thomas Martin',
    senderAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
  },
  {
    id: '2',
    text: 'Oui, tout à fait ! Quand seriez-vous disponible ?',
    timestamp: Date.now() - 3500000,
    senderId: '1',
    senderName: 'Marie Laurent',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    id: '3',
    text: 'Je suis libre ce weekend, samedi matin si cela vous convient.',
    timestamp: Date.now() - 3400000,
    senderId: '2',
    senderName: 'Thomas Martin',
    senderAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
  },
];

const ChatScreen = () => {
  const theme = useTheme<MD3Theme>();
  const [message, setMessage] = useState('');
  const currentUserId = '1'; // À remplacer par l'ID de l'utilisateur connecté

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <Animated.View
        entering={FadeInUp}
        layout={Layout.springify()}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : null,
        ]}
      >
        {!isOwnMessage && (
          <Avatar.Image
            size={32}
            source={{ uri: item.senderAvatar }}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              borderBottomLeftRadius: isOwnMessage ? 16 : 4,
              borderBottomRightRadius: isOwnMessage ? 4 : 16,
            },
          ]}
        >
          {!isOwnMessage && (
            <Text
              variant="labelSmall"
              style={[
                styles.senderName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.senderName}
            </Text>
          )}
          <Text
            style={{
              color: isOwnMessage
                ? theme.colors.onPrimary
                : theme.colors.onSurfaceVariant,
            }}
          >
            {item.text}
          </Text>
          <Text
            variant="labelSmall"
            style={[
              styles.timestamp,
              {
                color: isOwnMessage
                  ? theme.colors.onPrimary
                  : theme.colors.onSurfaceVariant,
                opacity: 0.7,
              },
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Ici, vous ajouteriez la logique pour envoyer le message
      console.log('Message envoyé:', message);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={mockMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />
      <Surface style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <TextInput
          mode="outlined"
          value={message}
          onChangeText={setMessage}
          placeholder="Votre message..."
          style={styles.input}
          multiline
          maxLength={500}
          dense
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={sendMessage}
          disabled={!message.trim()}
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    marginRight: 8,
    marginLeft: 0,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  senderName: {
    marginBottom: 4,
  },
  timestamp: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
  },
});

export default ChatScreen;
