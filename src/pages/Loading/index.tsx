import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '@/constants/theme';

const Loading: React.FC = () => (
  <View style={styles.container}>
    <Image source={require('@/assets/spartan-macro.png')} style={styles.logo} resizeMode="contain" />
    <ActivityIndicator size="large" color={COLORS.primary} style={styles.indicator} />
    <Text style={styles.text}>Loading Application...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display:'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: COLORS.background,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
    borderRadius: 25, // Use number for React Native
    backgroundColor: 'transparent', // Remove background
  },
  indicator: {
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: COLORS.cardForeground,
    fontWeight: '500',
  },
});

export default Loading;
