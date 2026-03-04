import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import Loading from '@/pages/Loading';
import Auth from '@/pages/Auth';
import Onboarding, { OnboardingData } from '@/pages/Onboarding';
import ErrorPage from '@/pages/Error';
import { COLORS } from '@/constants/theme';
import { checkSupabaseConnection } from '@/lib/utils/checks';

type AppScreen = 'loading' | 'auth' | 'onboarding' | 'home' | 'error';

export default function Page() {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(COLORS.background);
  }, []);

  // centralize Supabase check using helper
  const checkSupabase = useCallback(async (maxAttempts = 5, delayMs = 2000) => {
    setShowRetry(false);
    setLoadingMessage('Checking backend connection...');

    const result = await checkSupabaseConnection(maxAttempts, delayMs);
    if (result.ok) {
      setLoadingMessage('Connected.');
      return true;
    }

    // After retries failed
    setLoadingMessage('Unable to reach backend. Please check your connection.');
    setShowRetry(true);
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await checkSupabase();
      if (!mounted) return;
      if (ok) setScreen('auth');
    })();
    return () => { mounted = false; };
  }, [checkSupabase]);

  const handleRetry = async () => {
    setShowRetry(false);
    setLoadingMessage('Retrying...');
    const ok = await checkSupabase();
    if (ok) setScreen('auth');
  };

  const handleAuthComplete = () => setScreen('onboarding');

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding complete:', data);
    setScreen('home');
  };

  return (
    <SafeAreaProvider style={styles.safeProvider}>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <SafeAreaView style={styles.safeRoot} edges={["top", "bottom"]}>
          {screen === 'loading' && (
            <Loading
              message={loadingMessage}
              showRetry={showRetry}
              onRetry={handleRetry}
              onConnected={() => setScreen('auth')}
              onNavigateToError={() => setScreen('error')}
            />
          )}
          {screen === 'auth' && <Auth onAuthComplete={handleAuthComplete} />}
          {screen === 'onboarding' && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}

          {screen === 'error' && (
            <ErrorPage onRetry={() => setScreen('loading')} />
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeProvider: {
    backgroundColor: COLORS.background,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
