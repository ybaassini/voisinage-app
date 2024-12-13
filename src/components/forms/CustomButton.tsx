import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CustomButtonProps {
  mode: 'text' | 'outlined' | 'contained';
  onPress: () => void;
  style?: any;
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

const CustomButton = ({ mode, onPress, style, loading, icon, children }: CustomButtonProps) => {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Button
        mode={mode}
        onPress={onPress}
        style={[styles.button, style]}
        loading={loading}
        icon={icon}
        contentStyle={styles.buttonContent}
      >
        {children}
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default CustomButton;
