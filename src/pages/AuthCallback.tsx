import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL hash
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const errorDesc = hashParams.get('error_description');
        if (errorDesc) {
          setError(errorDesc.replace(/\+/g, ' '));
          return;
        }

        // Check for error in query params
        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get('error_description');
        if (queryError) {
          setError(queryError.replace(/\+/g, ' '));
          return;
        }

        // Supabase automatically handles the OAuth token exchange
        // via the URL hash. Just wait for the session to be set.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session) {
          navigate('/', { replace: true });
        } else {
          // Give Supabase a moment to process the hash
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              navigate('/', { replace: true });
            } else {
              setError('No authentication session received. Please try again.');
            }
          }, 1500);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
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
