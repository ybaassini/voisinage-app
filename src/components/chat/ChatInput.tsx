import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onImageSelect: (uri: string) => void;
  onDocumentSelect: (uri: string, name: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, onImageSelect, onDocumentSelect, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const theme = useTheme();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelect(result.assets[0].uri);
    }
  };

  const handleDocumentPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      onDocumentSelect(result.uri, result.name);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <IconButton
        icon="paperclip"
        size={24}
        onPress={handleDocumentPick}
        disabled={isLoading}
      />
      <IconButton
        icon="image"
        size={24}
        onPress={handleImagePick}
        disabled={isLoading}
      />
      <TextInput
        mode="flat"
        value={message}
        onChangeText={setMessage}
        placeholder="Votre message..."
        style={styles.input}
        multiline
        maxLength={1000}
        disabled={isLoading}
        right={
          <TextInput.Icon
            icon="send"
            disabled={!message.trim() || isLoading}
            onPress={handleSend}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: 'transparent',
  },
});
