import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/utils/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  lastEvent?: string | null;
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  signInWithOAuth: (provider: string, options?: any) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthProvider getSession error', error.message || error);
        } else if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('AuthProvider init error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setLastEvent(event);
      setSession(session ?? null);
      setUser(session?.user ?? null);
      // NOTE: supabase-js persists/clears storage for us when signIn/signOut is called.
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback(async (email: string, password: string, options?: any) => {
    return await supabase.auth.signUp({ email, password, options });
  }, []);

  const signInWithOAuth = useCallback(async (provider: string, options?: any) => {
    return await supabase.auth.signInWithOAuth({ provider: provider as any, options });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({ user, session, loading, lastEvent, signInWithPassword, signUp, signInWithOAuth, signOut }), [user, session, loading, lastEvent, signInWithPassword, signUp, signInWithOAuth, signOut]);

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
