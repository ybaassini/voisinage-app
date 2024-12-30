import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
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
import { formatDate, convertToDate } from '../utils/dateUtils';
import { ratingService } from '../services/ratingService';
import RatingModal from '../components/RatingModal';

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
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (params.recipient) {
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
    }
  }, [params.recipient, navigation]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      if (!user) {
        console.log('❌ ChatScreen: Utilisateur non connecté');
        return;
      }
      console.log('🔄 ChatScreen: Initialisation du chat pour:', {
        user: userProfile,
        recipient: params.recipient,
        conversationId: params.conversationId,
        postId: params.postId
      });
      
      try {
        let chatId = params.conversationId;

        if (!chatId && params.postId) {
          console.log('🔍 ChatScreen: Recherche d\'une conversation existante pour le post:', params.postId);
          const existingConversation = await chatService.findConversationByPostAndParticipants(
            params.postId,
            [user.uid, params.recipient.id]
          );

          if (existingConversation) {
            console.log('✅ ChatScreen: Conversation existante trouvée:', existingConversation.id);
            chatId = existingConversation.id;
          } else {
            console.log('📝 ChatScreen: Création d\'une nouvelle conversation');
            const newConversation = await chatService.createConversation({
              participants: [
                {
                  id: user.uid,
                  displayName: userProfile?.displayName || '',
                  avatar: userProfile?.avatar || ''
                },
                {
                  id: params.recipient.id,
                  displayName: params.recipient.displayName,
                  avatar: params.recipient.avatar || ''
                }
              ],
              postId: params.postId
            });
            console.log('✅ ChatScreen: Nouvelle conversation créée:', newConversation.id);
            chatId = newConversation.id;
          }
        }

        if (chatId) {
          setConversationId(chatId);
          console.log('👂 ChatScreen: Mise en place du listener de messages pour:', chatId);
          
          unsubscribe = chatService.subscribeToMessages(chatId, (chatMessages) => {
            console.log(`📨 ChatScreen: Réception de ${chatMessages.length} messages`);
            
            const formattedMessages: IMessage[] = chatMessages.map((msg) => {
              console.log('📝 Formatage du message:', {
                id: msg.id,
                type: msg.type,
                hasImage: msg.type === 'image' && msg.mediaUrl
              });

              const messageData: IMessage = {
                _id: msg.id,
                text: msg.text || '',
                createdAt: convertToDate(msg.createdAt),
                user: {
                  _id: msg.senderId,
                  name: msg.senderId === user.uid ? userProfile?.displayName : params.recipient.displayName,
                  avatar: msg.senderId === user.uid ? userProfile?.avatar : params.recipient.avatar
                }
              };

              // Only add image property if it exists and type is Image
              if (msg.type === 'image' && msg.mediaUrl) {
                messageData.image = msg.mediaUrl;
              }

              console.log('📝 Message formaté:', {
                id: messageData._id,
                date: messageData.createdAt,
                hasImage: 'image' in messageData
              });

              return messageData;
            });

            console.log('✅ ChatScreen: Messages formatés et mis à jour dans le state');
            setMessages(formattedMessages.reverse());
          });
        }
      } catch (error) {
        console.error('❌ ChatScreen: Erreur lors de l\'initialisation du chat:', error);
      }
    };

    initializeChat();
    return () => {
      if (unsubscribe) {
        console.log('👋 ChatScreen: Nettoyage du listener de messages');
        unsubscribe();
      }
    };
  }, [user, params.conversationId, params.postId, params.recipient]);

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

  if (!user) return null;

  return (
    <View style={styles.container}>
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
        alwaysShowSend
        
      />
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        recipientName={params.recipient.displayName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 24,
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
