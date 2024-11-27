import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Logo = () => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="hammer-wrench" 
        size={24} 
        color={theme.colors.primary}
        style={styles.icon}
      />
      <Text style={[styles.logo, { color: theme.colors.primary }]}>
        Jirani
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default Logo;
