import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'moderator' | 'user';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email || '' };
}

async function fetchRole(userId: string): Promise<AppRole> {
  try {
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
    if (!error && data) return data as AppRole;
  } catch {}
  return 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const roleRequestRef = useRef(0);

  const handleSession = useCallback((session: Session | null) => {
    const requestId = ++roleRequestRef.current;

    if (session?.user) {
      setUser(mapUser(session.user));
      setRole(null);
      setLoading(false);

      fetchRole(session.user.id)
        .then((userRole) => {
          if (roleRequestRef.current === requestId) {
            setRole(userRole);
          }
        })
        .catch(() => {
          if (roleRequestRef.current === requestId) {
            setRole('user');
          }
        });
    } else {
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        const msg = error.message.includes('already registered')
          ? 'An account with this email already exists. Try signing in instead.'
          : error.message;
        return { error: new Error(msg) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Unable to create account. Please try again.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.includes('Invalid')
          ? 'Invalid email or password. Please try again.'
          : error.message;
        return { error: new Error(msg) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Unable to sign in. Please try again.') };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) return { error: new Error(error.message) };
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Unable to send reset email.') };
    }
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
    // Manually clear any remaining Supabase auth data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/auth';
  };

  const refreshAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut, resetPassword, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

