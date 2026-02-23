import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone, X, Lock } from 'lucide-react';
import { EmailAuthForm, PhoneAuthForm, SocialAuthButtons } from '@/components/auth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const redirectTo = searchParams.get('redirect') || '/';
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const isResetMode = searchParams.get('mode') === 'reset';
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');
      if (errorParam) {
        const friendlyMessages: Record<string, string> = {
          'access_denied': 'Sign-in was cancelled. You can try again whenever you\'re ready.',
          'server_error': 'Something went wrong on our end. Please try again in a moment.',
          'temporarily_unavailable': 'The sign-in service is temporarily unavailable. Please try again shortly.',
          'invalid_request': 'There was a problem with the sign-in request. Please try again.',
        };
        const msg = friendlyMessages[errorParam] || errorDescription?.replace(/\+/g, ' ') || 'Sign-in failed. Please try again.';
        toast.error(msg);
        window.history.replaceState(null, '', '/auth');
      }
    }

    const errorInQuery = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (errorInQuery) {
      const msg = errorDesc?.replace(/\+/g, ' ') || 'Sign-in failed. Please try again.';
      toast.error(msg);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading && !isResetMode) {
      navigate(redirectTo);
    }
  }, [user, authLoading, navigate, redirectTo, isResetMode]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setResetting(true);
    toast.info('Password reset via email link is not yet supported. Please contact support.');
    setResetting(false);
  };

  const handleSuccess = () => {
    navigate(redirectTo);
  };

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => setTimedOut(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (authLoading && !timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md relative shadow-soft rounded-2xl border-border/60">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <X className="h-4 w-4" />
        </Button>
        {isResetMode ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Enter new password"
                    disabled={resetting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <PasswordInput
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    placeholder="Confirm new password"
                    disabled={resetting}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={resetting}>
                  {resetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center pb-3">
              <div className="flex justify-center mb-2">
                <img
                  src="/images/sp-logo.png"
                  alt="SP Granites"
                  className="h-14 w-auto block dark:hidden"
                />
                <img
                  src="/images/sp-logo-dark.png"
                  alt="SP Granites"
                  className="h-14 w-auto hidden dark:block"
                />
              </div>
              <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
              <CardDescription>{t('auth.signInDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMethod === 'email'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMethod === 'phone'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              {authMethod === 'email' ? (
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                    <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    <EmailAuthForm mode="signin" onSuccess={handleSuccess} />
                    <SocialAuthButtons />
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <EmailAuthForm mode="signup" onSuccess={handleSuccess} />
                    <SocialAuthButtons />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <PhoneAuthForm onSuccess={handleSuccess} />
                  <SocialAuthButtons />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
              <p>{t('auth.termsAgreement')}</p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
