import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

export type SupabaseCheckResult = {
  ok: boolean;
  session: any | null;
  error?: any;
};

export async function isInternetReachable(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return !!state.isConnected && (state.isInternetReachable ?? true);
  } catch (err) {
    console.log('NetInfo check error (helper):', err);
    return false;
  }
}

export async function checkSupabaseConnection(
  maxAttempts = 3,
  delayMs = 1200
): Promise<SupabaseCheckResult> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let lastError: any = undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Supabase helper check attempt ${attempt}/${maxAttempts}...`);
      const result = await supabase.auth.getSession();
      if (result.error) {
        lastError = result.error;
        console.log('Supabase helper returned error:', result.error);
      } else {
        return { ok: true, session: result.data?.session ?? null };
      }
    } catch (err) {
      lastError = err;
      console.log('Supabase helper exception:', err);
    }

    if (attempt < maxAttempts) await sleep(delayMs);
  }

  return { ok: false, session: null, error: lastError };
}
