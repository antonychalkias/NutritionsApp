import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient, processLock } from '@supabase/supabase-js'

// Minimal SecureStore adapter implementing getItem/setItem/removeItem for supabase-js
const SecureStoreAdapter = {
  async getItem(key: string) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (err) {
      console.error('SecureStore getItem error', err);
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore setItem error', err);
    }
  },
  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error('SecureStore removeItem error', err);
    }
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage: SecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })
