import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { useTheme, Avatar, Text, Surface, IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { Message as ChatMessage } from '../types/chat';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ChatScreen({ navigation }: any) {
  const theme = useTheme();
  const { user } = useAuth();
  const route = useRoute();
  const params = route.params as {
    conversationId?: string;
    recipientId?: string;
    postId?: string;
    recipientAvatar?: string;
    recipientName?: string;
  };
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (params.recipientName) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [params.recipientName, navigation]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      if (!user) {
        console.log('❌ Utilisateur non connecté');
        return;
      }

      // Si nous avons un conversationId, c'est une conversation existante
      if (params.conversationId) {
        console.log('📝 Utilisation de la conversation existante:', params.conversationId);
        setConversationId(params.conversationId);
      } 
      // Si nous avons un postId et recipientId, chercher une conversation existante
      else if (params.postId && params.recipientId) {
        try {
          // Chercher une conversation existante
          const existingConversation = await chatService.findConversationByPostAndParticipants(
            params.postId,
            [user.uid, params.recipientId]
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
          recipientId: params.recipientId 
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
                createdAt: msg.createdAt,
                user: {
                  _id: msg.senderId,
                  name: msg.senderName,
                },
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
  }, [user, params.conversationId, params.recipientId, params.recipientName, params.postId, conversationId]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user) {
      console.log('❌ Erreur: utilisateur non connecté');
      return;
    }

    try {
      console.log('📤 Préparation de l\'envoi du message');
      
      let currentConversationId = conversationId;
      
      // Si pas de conversationId, créer une nouvelle conversation
      if (!currentConversationId) {
        console.log('🔄 Création d\'une nouvelle conversation au premier message');
        const conversation = await chatService.createConversation({
          participants: [
            { 
              id: user.uid,
              name: user.displayName || 'User'
            },
            { 
              id: params.recipientId,
              name: params.recipientName || 'User'
            }
          ],
          postId: params.postId
        });
        console.log('✅ Nouvelle conversation créée:', conversation.id);
        currentConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      const messageData = {
        conversationId: currentConversationId,
        text: newMessages[0].text,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        recipientId: params.recipientId || '',
        recipientName: params.recipientName || 'User',
        postId: params.postId,
        read: false
      };

      console.log('📤 Envoi du message avec les données:', messageData);
      await chatService.sendMessage(messageData);
      console.log('✅ Message envoyé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    }
  }, [conversationId, user, params.recipientId, params.recipientName, params.postId]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: theme.colors.primary,
          },
          left: {
            backgroundColor: theme.colors.surfaceVariant,
          },
        }}
        textStyle={{
          right: {
            color: theme.colors.onPrimary,
          },
          left: {
            color: theme.colors.onSurfaceVariant,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
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

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerInfo}>
            {params.recipientAvatar ? (
              <Avatar.Image
                size={40}
                source={{ uri: params.recipientAvatar }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={40}
                label={(params.recipientName || 'User').substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
            )}
            <View style={styles.headerText}>
              <Text variant="titleMedium" numberOfLines={1}>
                {params.recipientName || 'Chat'}
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
        }}
        renderBubble={renderBubble}
        placeholder="Écrivez votre message..."
        renderAvatar={null}
        timeFormat="HH:mm"
        dateFormat="DD/MM/YYYY"
        locale="fr"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
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
});
