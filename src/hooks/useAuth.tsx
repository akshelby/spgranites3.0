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

function isAdminEmail(email?: string): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

function ensureProfile(userId: string, email: string): void {
  (async () => {
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
    } catch {}
  })();
}

function ensureAdminRole(userId: string, email: string): void {
  if (!isAdminEmail(email)) return;
  (async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (!data) {
        await (supabase.from('user_roles') as any)
          .insert({ user_id: userId, role: 'admin' });
      } else if (data.role !== 'admin') {
        await (supabase.from('user_roles') as any)
          .update({ role: 'admin' })
          .eq('user_id', userId);
      }
    } catch {}
  })();
}

function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function resolveRole(userId: string, email?: string): Promise<AppRole> {
  if (isAdminEmail(email)) {
    ensureProfile(userId, email!);
    ensureAdminRole(userId, email!);
    return 'admin';
  }
  if (email) {
    ensureProfile(userId, email);
  }
  try {
    const query = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
      .then((res) => res);
    const { data } = await withTimeout(query, 3000, { data: null, error: null } as any);
    return (data?.role as AppRole) || 'user';
  } catch {
    return 'user';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setRole((prev) => prev ?? 'user');
        setLoading(false);
      }
    }, 4000);

    async function init() {
      try {
        const { data: { session: s } } = await withTimeout(
          supabase.auth.getSession(),
          3000,
          { data: { session: null } } as any
        );
        if (!mounted) return;
        setSession(s);
        const mapped = mapUser(s?.user ?? null);
        setUser(mapped);
        if (mapped) {
          const r = await resolveRole(mapped.id, mapped.email);
          if (mounted) setRole(r);
        }
      } catch {
      } finally {
        if (mounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s);
      const mapped = mapUser(s?.user ?? null);
      setUser(mapped);
      if (mapped) {
        const r = await resolveRole(mapped.id, mapped.email);
        if (mounted) setRole(r);
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
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
    setUser(null);
    setSession(null);
    setRole(null);
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    });
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
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
