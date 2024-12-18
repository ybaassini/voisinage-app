import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send, BubbleProps, Actions, MessageImage } from 'react-native-gifted-chat';
import { useTheme, Avatar, Text, Surface, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { Message as ChatMessage, MessageType } from '../types/chat';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { postService } from '../services/postService';
import { useNotificationContext } from '../providers/NotificationProvider';
import { UserProfile } from '../types/user';
import { notificationService } from '../services/notificationService';

export default function ChatScreen({ navigation }: any) {
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  const route = useRoute();
  const params = route.params as {
    conversationId?: string;
    postId?: string;
    recipient: UserProfile;
    isPostOwner?: boolean;
  };
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { sendNotification } = useNotificationContext();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (params.recipient) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [params.recipient, navigation]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      if (!user) {
        console.log('❌ Utilisateur non connecté');
        return;
      }
      console.log('📝 Initialisation du chat: ', userProfile);
      

      // Si nous avons un conversationId, c'est une conversation existante
      if (params.conversationId) {
        console.log('📝 Utilisation de la conversation existante:', params.conversationId);
        setConversationId(params.conversationId);
      } 
      // Si nous avons un postId et recipient.id, chercher une conversation existante
      else if (params.postId && params.recipient.id) {
        try {
          // Chercher une conversation existante
          const existingConversation = await chatService.findConversationByPostAndParticipants(
            params.postId,
            [user.uid, params.recipient.id]
          );

          if (existingConversation) {
            console.log('✅ Conversation existante trouvée:', existingConversation.id);
            setConversationId(existingConversation.id);
          } else {
            console.log('ℹ️ Aucune conversation existante - En attente du premier message');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la recherche de conversation:', error);
        }
      } else {
        console.error('❌ Impossible d\'initialiser le chat: données manquantes', { 
          conversationId: params.conversationId, 
          postId: params.postId,
          recipientId: params.recipient.id 
        });
        return;
      }

      // S'abonner aux messages si nous avons un conversationId
      if (conversationId) {
        console.log('👂 Abonnement aux messages de la conversation:', conversationId);
        unsubscribe = chatService.subscribeToMessages(conversationId, (newMessages) => {
          setMessages(
            newMessages
              .map((msg: ChatMessage) => ({
                _id: msg.id,
                text: msg.text,
                createdAt: msg.createdAt instanceof Date 
                  ? msg.createdAt 
                  : (msg.createdAt.seconds ? new Date(msg.createdAt.seconds * 1000) : msg.createdAt),
                user: {
                  _id: msg.senderId,
                  name: msg.senderName,
                  avatar: msg.senderAvatar
                },
                ...(msg.type === 'image' && { image: msg.mediaUrl }),
                ...(msg.type === 'document' && { 
                  text: msg.fileName || 'Document',
                  data: { url: msg.mediaUrl }
                })
              }))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          );
        });
      }
    };

    initializeChat();

    return () => {
      if (unsubscribe) {
        console.log('👋 Désabonnement des messages');
        unsubscribe();
      }
    };
  }, [user, params.conversationId, params.recipient, params.postId, conversationId]);

  useEffect(() => {
    let unsubscribe: () => void;

    const initializeChat = async () => {
      if (!user || !params.recipient || !params.conversationId) {
        console.error('❌ Données manquantes pour initialiser le chat');
        return;
      }

      const currentConversationId = params.conversationId;
      console.log('🔄 Initialisation du chat pour la conversation:', currentConversationId);

      // Mark messages as read when entering the chat
      await chatService.markMessagesAsRead(currentConversationId, user.uid);

      if (currentConversationId) {
        console.log('👂 Abonnement aux messages de la conversation:', currentConversationId);
        unsubscribe = chatService.subscribeToMessages(currentConversationId, (newMessages) => {
          setMessages(
            newMessages
              .map((msg: ChatMessage) => ({
                _id: msg.id,
                text: msg.text,
                createdAt: msg.createdAt instanceof Date 
                  ? msg.createdAt 
                  : (msg.createdAt.seconds ? new Date(msg.createdAt.seconds * 1000) : msg.createdAt),
                user: {
                  _id: msg.senderId,
                  name: msg.senderName,
                  avatar: msg.senderAvatar
                },
                ...(msg.type === 'image' && { image: msg.mediaUrl }),
                ...(msg.type === 'document' && { 
                  text: msg.fileName || 'Document',
                  data: { url: msg.mediaUrl }
                })
              }))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          );
        });
      }
    };

    initializeChat();

    return () => {
      if (unsubscribe) {
        console.log('👋 Désabonnement des messages');
        unsubscribe();
      }
    };
  }, [user, params.conversationId, params.recipient, params.postId, conversationId]);

  useEffect(() => {
    // Marquer les messages comme lus quand l'utilisateur ouvre la conversation
    if (conversationId && user) {
      chatService.markConversationAsRead(conversationId, user.uid);
    }
  }, [conversationId, user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await handleMediaUpload(uri, 'image');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      await handleMediaUpload(result.uri, 'document', result.name);
    }
  };

  const handleMediaUpload = async (uri: string, type: MessageType, fileName?: string) => {
    if (!user || !userProfile || !params.recipient.id || !conversationId) return;

    try {
      setIsUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `chat/${conversationId}/${Date.now()}_${fileName || 'media'}`;
      const mediaUrl = await chatService.uploadMedia(blob, path);

      const messageData = {
        conversationId,
        type,
        text: type === 'document' ? `Document: ${fileName}` : '',
        mediaUrl,
        mediaType: type,
        fileName,
        senderId: user.uid,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatar,
        recipientId: params.recipient.id,
        recipientName: params.recipient.displayName,
        postId: params.postId,
      };

      await chatService.sendMessage(messageData);
    } catch (error) {
      console.error('Erreur lors de l\'upload du média:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSend = useCallback(async (newMessages = []) => {
    if (!user || !params.recipient || !params.conversationId) {
      console.error('❌ Données manquantes pour envoyer le message');
      return;
    }

    try {
      const currentConversationId = params.conversationId;

      const messageData = {
        conversationId: currentConversationId,
        type: 'text',
        text: newMessages[0].text,
        senderId: user.uid,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatar || '',
        recipientId: params.recipient.id,
        recipientName: params.recipient.displayName,
        postId: params.postId,
        read: false
      };

      console.log('📤 Envoi du message avec les données:', messageData);
      await chatService.sendMessage(messageData);

      // Create notification if this is a response to a post
      if (params.postId && params.isPostOwner) {
        await notificationService.createNotification({
          userId: params.recipient.id,
          type: 'post_response',
          title: 'Nouvelle réponse',
          message: `${userProfile.displayName} a répondu à votre demande`,
          data: {
            postId: params.postId,
            conversationId: currentConversationId,
            senderId: user.uid
          }
        });
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    }
  }, [conversationId, user, params.recipient, params.postId, userProfile]);

  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: theme.colors.primary,
          },
          left: {
            backgroundColor: theme.colors.surfaceVariant,
          }
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: theme.colors.onSurfaceVariant,
          }
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={[styles.inputToolbar, {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
        }]}
        primaryStyle={styles.inputPrimary}
        textInputStyle={styles.textInput}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <MaterialCommunityIcons 
          name="send" 
          size={24} 
          color={theme.colors.primary}
          style={styles.sendIcon}
        />
      </Send>
    );
  };

  const renderActions = () => {
    return (
      <Actions
        containerStyle={styles.actionsContainer}
        icon={() => (
          <MaterialCommunityIcons
            name="paperclip"
            size={24}
            color={theme.colors.primary}
          />
        )}
        options={{
          'Choisir une image': pickImage,
          'Choisir un document': pickDocument,
          'Annuler': () => {},
        }}
        optionTintColor={theme.colors.primary}
      />
    );
  };

  const renderMessageImage = (props: any) => {
    return (
      <MessageImage
        {...props}
        imageStyle={[
          styles.messageImage,
          props.position === 'right' ? { borderTopRightRadius: 0 } : { borderTopLeftRadius: 0 },
        ]}
      />
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
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
              <Text variant="titleMedium" numberOfLines={1}>
                {params.recipient.displayName || 'Chat'}
              </Text>
              {params.postId && (
                <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
                  Conversation liée à une demande
                </Text>
              )}
            </View>
          </View>
        </View>
      </Surface>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.uid || '',
          name: userProfile ? userProfile.displayName : '',
          avatar: userProfile?.avatar,
        }}
        renderBubble={renderBubble}
        renderActions={renderActions}
        renderMessageImage={renderMessageImage}
        renderSend={renderSend}
        isLoadingEarlier={isUploading}
        renderLoading={() => <ActivityIndicator size="large" color={theme.colors.primary} />}
        placeholder="Écrivez votre message..."
        timeFormat="HH:mm"
        dateFormat="DD/MM/YYYY"
        renderUsernameOnMessage
        alwaysShowSend
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    width: '100%',
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 56,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  subtitle: {
    opacity: 0.7,
  },
  avatar: {
    marginRight: 8,
  },
  backButton: {
    margin: 0,
  },
  inputToolbar: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 60,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100, // Permet au texte de s'étendre jusqu'à 5 lignes environ
    minHeight: 40,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sendIcon: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionsContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 0,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13,
    margin: 3,
    resizeMode: 'cover',
  },
});
