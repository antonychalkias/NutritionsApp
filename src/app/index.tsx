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
import { supabase } from '@/lib/utils/supabase';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { getProfileIsOnboarded } from '@/lib/api/profiles';

type AppScreen = 'loading' | 'auth' | 'onboarding' | 'home' | 'error';

async function resolveScreenForUser(userId: string): Promise<'onboarding' | 'home'> {
  const isOnboarded = await getProfileIsOnboarded(userId);
  return isOnboarded ? 'home' : 'onboarding';
}

export default function Page() {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(COLORS.background);
  }, []);

  const checkSupabase = useCallback(async (maxAttempts = 5, delayMs = 2000) => {
    setShowRetry(false);
    setLoadingMessage('Checking backend connection...');

    const result = await checkSupabaseConnection(maxAttempts, delayMs);
    if (result.ok) {
      setLoadingMessage('Connected.');
      return true;
    }

    setLoadingMessage('Unable to reach backend. Please check your connection.');
    setShowRetry(true);
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await checkSupabase();
      if (!mounted) return;
      if (!ok) {
        setScreen('error');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setScreen('auth');
          return;
        }

        if (data?.session) {
          const next = await resolveScreenForUser(data.session.user.id);
          if (mounted) setScreen(next);
        } else {
          setScreen('auth');
        }
      } catch (err) {
        console.error('Error checking session', err);
        setScreen('auth');
      }
    })();

    return () => { mounted = false; };
  }, [checkSupabase]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const next = await resolveScreenForUser(session.user.id);
        setScreen(next);
      } else if (event === 'SIGNED_OUT') {
        setScreen('auth');
      }
    });

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    setShowRetry(false);
    setLoadingMessage('Retrying...');
    const ok = await checkSupabase();
    if (ok) setScreen('auth');
  };

  const handleAuthComplete = () => setScreen('onboarding');

  const handleOnboardingComplete = (_data: OnboardingData) => {
    setScreen('home');
  };

  return (
    <AuthProvider>
      <SafeAreaProvider style={styles.safeProvider}>
        <View style={styles.root}>
          <StatusBar style="light" />
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
    </AuthProvider>
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
