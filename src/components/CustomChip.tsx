import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomChipProps {
  icon?: string;
  text: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium';
  disabled?: boolean;
}

const CustomChip: React.FC<CustomChipProps> = ({
  icon,
  text,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  const theme = useTheme();

  const getChipStyles = () => {
    const baseStyles = [
      styles.chip,
      size === 'small' ? styles.chipSmall : styles.chipMedium,
    ];

    switch (variant) {
      case 'primary':
        baseStyles.push({
          backgroundColor: theme.colors.secondary,
        });
        break;
      case 'secondary':
        baseStyles.push({
          backgroundColor: theme.colors.secondaryContainer,
        });
        break;
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.secondary,
        });
        break;
    }

    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    return baseStyles;
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.onSurfaceDisabled;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.surface;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getIconColor = () => {
    if (disabled) {
      return theme.colors.onSurfaceDisabled;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.surface;
      case 'secondary':
      case 'outline':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const ChipContent = () => (
    <View style={styles.content}>
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={size === 'small' ? 16 : 18}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text
        variant={size === 'small' ? 'labelSmall' : 'labelMedium'}
        style={[styles.text, { color: getTextColor() }]}
      >
        {text}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={getChipStyles()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <ChipContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={getChipStyles()}>
      <ChipContent />
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chipSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipMedium: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomChip;
