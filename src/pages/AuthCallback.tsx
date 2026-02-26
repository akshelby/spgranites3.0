import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const errorDesc = hashParams.get('error_description');
        if (errorDesc) {
          setError(errorDesc.replace(/\+/g, ' '));
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get('error_description');
        if (queryError) {
          setError(queryError.replace(/\+/g, ' '));
          return;
        }

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          searchParams.get('code') || ''
        );

        if (exchangeError) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/', { replace: true });
            return;
          }

          if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              navigate('/', { replace: true });
              return;
            }
          }

          setError(exchangeError.message);
          return;
        }

        if (data?.session) {
          navigate('/', { replace: true });
        } else {
          setError('No session received. Please try signing in again.');
        }
      } catch (err: any) {
        const msg = err?.message || 'Something went wrong';
        if (msg.includes('signal') || msg.includes('abort')) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/', { replace: true });
            return;
          }
        }
        setError(msg);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
