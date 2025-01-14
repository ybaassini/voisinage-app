import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text, Surface, useTheme, Avatar } from 'react-native-paper';
import { Message } from '../../types/chat';
import { Timestamp } from '@react-native-firebase/firestore';
import { theme } from '../../theme/theme';
import { convertToDate, formatDate, formatRelativeTime } from '../../utils/dateUtils';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showDate?: boolean;
  onImagePress?: (imageUrl: string) => void;
}

export const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  showDate = true,
  onImagePress 
}: MessageBubbleProps) => {
  const theme = useTheme();

  const renderAvatar = () => {
    
    const avatar = message.senderAvatar;
    const name = message.senderName;
    
    if (avatar) {
      return (
        <Avatar.Image
          size={32}
          source={{ uri: avatar }}
          style={styles.avatar}
        />
      );
    }
    
    return (
      <Avatar.Text
        size={32}
        label={name.substring(0, 2).toUpperCase()}
        style={styles.avatar}
      />
    );
  };

  return (
    <View style={styles.messageContainer}>
      
      <View style={[
        styles.messageRow,
        isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow
      ]}>
        {!isOwnMessage && renderAvatar()}
        <View style={styles.messageContent}>
          <Surface style={[
            styles.bubble,
            isOwnMessage ? styles.ownMessage : styles.otherMessage
          ]}>
            {message.type === 'image' && message.mediaUrl && (
              <Pressable onPress={() => onImagePress?.(message.mediaUrl!)}>
                <Image
                  source={{ uri: message.mediaUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </Pressable>
            )}
            {message.text && (
              <Text
                style={[
                  styles.messageText,
                  { color: isOwnMessage ? theme.colors.onPrimary : theme.colors.onSurface }
                ]}
              >
                {message.text}
              </Text>
            )}
          </Surface>
          <View style={[
            styles.timeContainer,
            isOwnMessage ? styles.ownTimeContainer : styles.otherTimeContainer
          ]}>
            <Text style={styles.timestamp}>
              {formatDate(message.createdAt, 'dd/MM/yyyy HH:mm:ss')}
            </Text>
          </View>
        </View>
        {isOwnMessage && renderAvatar()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
  },
  dateHeader: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    marginVertical: 8,
    textTransform: 'capitalize',
    backgroundColor: theme.colors.surfaceVariant,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    padding: 12,
    minWidth: 60,
    elevation: 1,
    borderRadius: 20,
  },
  ownMessage: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 4,
    marginLeft: 40,
  },
  otherMessage: {
    backgroundColor: theme.colors.surfaceVariant,
    borderTopLeftRadius: 4,
    marginRight: 40,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeContainer: {
    color: theme.colors.onPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
    opacity: 0.8,
  },
  ownTimeContainer: {
    justifyContent: 'flex-end',
  },
  otherTimeContainer: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.onPrimary,
    marginRight: 8,
  },
  relativeTime: {
    fontSize: 11,
    color: theme.colors.onPrimary,
    fontStyle: 'italic',
  },
  avatar: {
    marginHorizontal: 8,
  },
});
