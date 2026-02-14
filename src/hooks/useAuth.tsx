import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken, removeToken } from '@/lib/api';

type AppRole = 'admin' | 'moderator' | 'user';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { token: string } | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.get('/api/auth/me')
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setSession({ token });
            setRole(data.role as AppRole);
          } else {
            removeToken();
          }
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const data = await api.post('/api/auth/signup', { email, password });
      setToken(data.token);
      setUser(data.user);
      setSession({ token: data.token });
      setRole('user');
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.post('/api/auth/signin', { email, password });
      setToken(data.token);
      setUser(data.user);
      setSession({ token: data.token });
      setRole(data.role as AppRole);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/signout');
    } catch {}
    removeToken();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
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
