import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import Loading from '@/pages/Loading';
import Auth from '@/pages/Auth';
import Onboarding, { OnboardingData } from '@/pages/Onboarding';
import { COLORS } from '@/constants/theme';

type AppScreen = 'loading' | 'auth' | 'onboarding' | 'home';

export default function Page() {
  const [screen, setScreen] = useState<AppScreen>('loading');

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(COLORS.background);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setScreen('auth'), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthComplete = () => setScreen('onboarding');

  const handleOnboardingComplete = (data: OnboardingData) => {
    // TODO: save onboarding data (e.g. to context / secure store / backend)
    console.log('Onboarding complete:', data);
    setScreen('home');
  };

  return (
    <SafeAreaProvider style={styles.safeProvider}>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <SafeAreaView style={styles.safeRoot} edges={['top', 'bottom']}>
          {screen === 'loading' && <Loading />}
          {screen === 'auth' && <Auth onAuthComplete={handleAuthComplete} />}
          {screen === 'onboarding' && (
            <Onboarding onComplete={handleOnboardingComplete} />
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
