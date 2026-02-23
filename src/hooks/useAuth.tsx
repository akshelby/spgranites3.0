import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api, getToken, setToken, removeToken } from '@/lib/api';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/api/auth/me');
      if (data?.user) {
        setUser(data.user);
        setRole((data.role as AppRole) || 'user');
      } else {
        removeToken();
        setUser(null);
        setRole(null);
      }
    } catch {
      removeToken();
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleSessionExpired = () => {
      removeToken();
      setUser(null);
      setRole(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuth]);

  const signUp = async (email: string, password: string) => {
    try {
      const data = await api.post('/api/auth/signup', { email, password });
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setRole('user');
      }
      return { error: null };
    } catch (err: any) {
      const msg = err?.message?.includes('already registered')
        ? 'An account with this email already exists. Try signing in instead.'
        : err?.message || 'Unable to create account. Please try again.';
      return { error: new Error(msg) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post('/api/auth/signin', { email, password });
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setRole((data.role as AppRole) || 'user');
      }
      return { error: null };
    } catch (err: any) {
      const msg = err?.message?.includes('Invalid')
        ? 'Invalid email or password. Please try again.'
        : err?.message || 'Unable to sign in. Please try again.';
      return { error: new Error(msg) };
    }
  };

  const resetPassword = async (_email: string) => {
    return { error: new Error('Password reset is not available yet. Please contact support.') };
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/signout');
    } catch {}
    removeToken();
    setUser(null);
    setRole(null);
    window.location.href = '/auth';
  };

  const refreshAuth = async () => {
    await checkAuth();
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
