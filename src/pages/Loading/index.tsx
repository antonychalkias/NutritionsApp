import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
import { isInternetReachable, checkSupabaseConnection } from '@/lib/utils/checks';
import { COLORS } from '@/constants/theme';
import styles from './Loading.styles';

interface LoadingProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onConnected?: () => void;
  onNavigateToError?: () => void;
}

const Loading: React.FC<LoadingProps> = ({ message: initialMessage, showRetry: initialShowRetry = false, onRetry, onConnected, onNavigateToError }) => {
  const s: any = styles;
  const [message, setMessage] = useState<string | undefined>(initialMessage ?? 'Loading Application...');
  const [showRetry, setShowRetry] = useState<boolean>(initialShowRetry);

  const runChecks = useCallback(async () => {
    setShowRetry(false);
    setMessage('Checking network connectivity...');

    const online = await isInternetReachable();
    if (!online) {
      setMessage('No internet connection detected.');
      onNavigateToError?.();
      return;
    }

    setMessage('Network OK. Checking backend...');
    const result = await checkSupabaseConnection();
    if (result.ok) {
      setMessage('Connected.');
      onConnected?.();
    } else {
      console.log('Backend check failed (loading page):', result.error);
      setMessage('Unable to reach backend. Please try again.');
      setShowRetry(true);
    }
  }, [onConnected, onNavigateToError]);

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    runChecks();
    return () => { mounted = false; };
  }, [runChecks]);

  return (
    <View style={s.container}>
      <Image source={require('@/assets/spartan-macro.png')} style={s.logo} resizeMode="contain" />
      <ActivityIndicator size="large" color={COLORS.primary} style={s.indicator} />
      <Text style={s.text}>{message ?? 'Loading Application...'}</Text>
      {(showRetry || initialShowRetry) && (
        <TouchableOpacity
          style={s.retryButton}
          onPress={() => {
            setShowRetry(false);
            setMessage('Retrying...');
            if (onRetry) onRetry();
            runChecks();
          }}
          activeOpacity={0.8}
        >
          <Text style={s.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Loading;
