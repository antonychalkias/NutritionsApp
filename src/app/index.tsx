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
      if (!ok) {
        setScreen('error');
        return;
      }

      // If backend is up, check for an existing session and route accordingly.
      try {
        // Use the AuthProvider's supabase-backed session getter instead of calling supabase directly
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setScreen('auth');
          return;
        }

        if (data?.session) {
          setScreen('onboarding');

          try {
            const user = data.session.user;
            console.log('Existing session user:', user);
            const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileErr) console.log('No profile found or error fetching profile on startup:', profileErr.message);
            else console.log('User profile on startup:', profile);
          } catch (error_) {
            console.error('Error fetching profile on startup', error_);
          }

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

  // Subscribe to auth state changes so the UI responds to sign-in / sign-out
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Events: 'SIGNED_IN', 'SIGNED_OUT', 'PASSWORD_RECOVERY', etc.
      if (event === 'SIGNED_IN') {
        // User signed in — route to onboarding (or home depending on app state)
        setScreen('onboarding');
        try {
          console.log('SIGNED_IN event, user:', session?.user);
          if (session?.user) {
            const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (profileErr) console.log('No profile found or error fetching profile on sign-in:', profileErr.message);
            else console.log('User profile on sign-in:', profile);
          }
        } catch (err) {
          console.error('Error fetching profile after SIGNED_IN', err);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out — route to auth screen
        console.log('SIGNED_OUT event');
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

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding complete:', data);
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
