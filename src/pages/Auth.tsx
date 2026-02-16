import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone, X } from 'lucide-react';
import { EmailAuthForm, PhoneAuthForm, SocialAuthButtons } from '@/components/auth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const redirectTo = searchParams.get('redirect') || '/';
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  useEffect(() => {
    if (user && !authLoading) {
      navigate(redirectTo);
    }
  }, [user, authLoading, navigate, redirectTo]);

  const handleSuccess = () => {
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md relative shadow-float rounded-2xl border-border/30">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
          <CardDescription>{t('auth.signInDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Method Toggle */}
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
      </Card>
    </div>
  );
};

export default Auth;
