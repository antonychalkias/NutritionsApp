import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './Error.styles';

interface ErrorProps {
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorProps> = ({ onRetry }) => {
  const s: any = styles;
  return (
    <View style={s.container}>
      <Image source={require('@/assets/spartan-macro.png')} style={s.logo} resizeMode="contain" />
      <Text style={s.title}>No Internet Connection</Text>
      <Text style={s.message}>Please check your connection and try again.</Text>

      <TouchableOpacity style={s.retryButton} onPress={onRetry} activeOpacity={0.8}>
        <Text style={s.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorPage;

