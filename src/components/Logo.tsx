import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';


const Logo = () => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Image 
      source={require('../assets/logo.png')} 
      style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
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
