import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { useTheme, ActivityIndicator, Avatar, Text, IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { Message, CreateMessageData, MessageType } from '../types/chat';
import { useRoute } from '@react-navigation/native';
import { useNotificationContext } from '../providers/NotificationProvider';
import { notificationService } from '../services/notificationService';
import { convertToDate } from '../utils/dateUtils';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import ImageView from 'react-native-image-zoom-viewer';
import { Modal } from 'react-native';
import { theme } from '../theme/theme';
import RatingModal from '../components/RatingModal';
import { ratingService } from '../services/ratingService';
import { isSameDay } from 'date-fns';
import { serverTimestamp } from '@react-native-firebase/firestore';

export default function ChatScreen({ navigation }: any) {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as {
    conversationId?: string;
    postId?: string;
    recipient: any;
    isPostOwner?: boolean;
  };
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { sendNotification } = useNotificationContext();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (conversationId && user) {
      chatService.markConversationAsRead(conversationId, user.uid);
    }
  }, [conversationId, user]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      if (!user) {
        return;
      }

      try {
        let chatId = params.conversationId;

        if (!chatId && params.postId) {
          const existingConversation = await chatService.findConversationByPostAndParticipants(
            params.postId,
            [user.uid, params.recipient.id]
          );

          if (existingConversation) {
            chatId = existingConversation.id;
          }
        }

        if (chatId) {
          setConversationId(chatId);
          unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
            const processedMessages = newMessages.map(msg => ({
              ...msg,
              createdAt: convertToDate(msg.createdAt)
            }));
            setMessages(processedMessages.sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            ));
          });
        }
      } catch (error) {
        console.error('❌ ChatScreen: Erreur lors de l\'initialisation:', error);
      }
    };

    initializeChat();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, params.conversationId, params.postId, params.recipient]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerInfo}>
          {params.recipient.avatar ? (
            <Avatar.Image
              size={40}
              source={{ uri: params.recipient.avatar }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={params.recipient.displayName}
              style={styles.avatar}
            />
          )}
          <View style={styles.headerText}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {params.recipient.displayName || 'Chat'}
            </Text>
            {params.postId && (
              <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
                Conversation liée à une demande
              </Text>
            )}
          </View>
        </View>
      ),
      headerRight: () => (
        <IconButton
          icon="star-outline"
          iconColor={theme.colors.primary}
          size={24}
          onPress={() => setShowRatingModal(true)}
        />
      ),
    });
  }, [params.recipient, navigation]);

  const handleSendMessage = async (text: string) => {
    if (!user || !userProfile || !conversationId) return;

    try {
      const messageData: CreateMessageData = {
        conversationId,
        type: 'text' as MessageType,
        text,
        senderId: user.uid,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatar,
        recipientId: params.recipient.id,
        recipientName: params.recipient.displayName,
        recipientAvatar: params.recipient.avatar,
        postId: params.postId,
        createdAt: serverTimestamp(),
        read: false
      };

      await chatService.sendMessage(messageData);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
    }
  };

  const handleMediaUpload = async (uri: string, type: 'image' | 'document', fileName?: string) => {
    if (!user || !userProfile || !conversationId) return;

    try {
      setIsUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `chat/${conversationId}/${Date.now()}_${fileName || 'media'}`;
      const mediaUrl = await chatService.uploadMedia(blob, path);

      const messageData: CreateMessageData = {
        conversationId,
        type: type === 'document' ? 'document' as MessageType : 'image' as MessageType,
        text: type === 'document' ? `Document: ${fileName}` : '',
        mediaUrl,
        senderId: user.uid,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatar || '',
        recipientId: params.recipient.id,
        recipientName: params.recipient.displayName,
        postId: params.postId,
        createdAt: new Date(),
        read: false
      };

      await chatService.sendMessage(messageData);
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.uid;
    const showDate = index === 0 || !isSameDay(convertToDate(messages[index - 1]?.createdAt), convertToDate(item.createdAt));

    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showDate={showDate}
        onImagePress={(imageUrl) => setSelectedImage(imageUrl)}
      />
    );
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      await ratingService.addRating({
        rating,
        comment,
        senderId: user.uid,
        recipientId: params.recipient.id,
        postId: params.postId,
      });

      setShowRatingModal(false);
      Alert.alert(
        'Merci !',
        'Votre évaluation a été enregistrée avec succès.'
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'évaluation:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'enregistrement de votre évaluation.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun message</Text>
            </View>
          }
        />
      </View>

      <ChatInput
        onSendMessage={handleSendMessage}
        onImageSelect={(uri) => handleMediaUpload(uri, 'image')}
        onDocumentSelect={(uri, name) => handleMediaUpload(uri, 'document', name)}
        isLoading={isUploading}
      />

      <Modal visible={!!selectedImage} transparent>
        <ImageView
          imageUrls={[{ url: selectedImage! }]}
          onCancel={() => setSelectedImage(null)}
          enableSwipeDown
        />
      </Modal>

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        recipientId={params.recipient.id}
        recipientName={params.recipient.displayName}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    paddingVertical: 16,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: theme.colors.onPrimary,
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.onPrimary,
    opacity: 0.7,
  },
  avatar: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
});
