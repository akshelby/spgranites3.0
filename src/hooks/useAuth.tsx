import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

type AppRole = 'admin' | 'moderator' | 'user';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email || '' };
}

const ADMIN_EMAILS = ['akshelby9999@gmail.com', 'srajith9999@gmail.com'];

async function ensureProfile(userId: string, email: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) {
      await (supabase.from('profiles') as any).insert({
        user_id: userId,
        email: email,
        display_name: email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Error ensuring profile:', err);
  }
}

async function ensureAdminRole(userId: string, email: string): Promise<void> {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) return;
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) {
    await (supabase.from('user_roles') as any).insert({ user_id: userId, role: 'admin' });
  } else if (data.role !== 'admin') {
    await (supabase.from('user_roles') as any).update({ role: 'admin' }).eq('user_id', userId);
  }
}

async function fetchRole(userId: string, email?: string): Promise<AppRole> {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    try {
      await ensureProfile(userId, email);
      await ensureAdminRole(userId, email);
    } catch (err) {
      console.error('Error in admin setup (non-blocking):', err);
    }
    return 'admin';
  }
  try {
    if (email) {
      await ensureProfile(userId, email);
    }
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    return (data?.role as AppRole) || 'user';
  } catch (err) {
    console.error('Error fetching role:', err);
    return 'user';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      const mapped = mapUser(s?.user ?? null);
      setUser(mapped);
      setLoading(false);
      clearTimeout(sessionTimeout);
      if (mapped) {
        try {
          const r = await fetchRole(mapped.id, mapped.email);
          setRole(r);
        } catch (err) {
          console.error('Error fetching role:', err);
          setRole('user');
        }
      }
    }).catch(() => {
      clearTimeout(sessionTimeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      const mapped = mapUser(s?.user ?? null);
      setUser(mapped);
      setLoading(false);
      if (mapped) {
        try {
          const r = await fetchRole(mapped.id, mapped.email);
          setRole(r);
        } catch (err) {
          console.error('Error fetching role:', err);
          setRole('user');
        }
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      setRole(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    });
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut, resetPassword }}>
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
