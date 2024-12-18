import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme/theme';

interface CustomTextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  numberOfLines?: number;
  maxLength?: number;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const CustomTextArea = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  numberOfLines = 4,
  maxLength,
  placeholder,
  autoCapitalize = 'sentences',
}: CustomTextAreaProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        mode="outlined"
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            height: numberOfLines * 24, // Approximative line height
            textAlignVertical: 'top', // Pour que le texte commence en haut
          },
        ]}
      />
      {maxLength && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 0,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: theme.colors.outline,
    paddingTop: 8, // Pour un meilleur alignement du texte
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
  },
});

export default CustomTextArea;
