import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './Error.styles';

interface ErrorProps {
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorProps> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/spartan-macro.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>Please check your connection and try again.</Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorPage;

