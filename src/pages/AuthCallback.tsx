import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { setToken } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          const errorDesc = searchParams.get('error_description');
          if (errorDesc) {
            setError(errorDesc);
            return;
          }
          setError('No authentication token received');
          return;
        }

        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });

        const data = await response.json();
        if (!response.ok || !data.token) {
          setError(data.error || 'Authentication failed');
          return;
        }

        setToken(data.token);
        await refreshAuth();
        navigate('/', { replace: true });
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    };

    handleCallback();
  }, [navigate, refreshAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="text-destructive text-lg font-medium">Sign in failed</div>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
