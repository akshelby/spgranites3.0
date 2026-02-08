import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone } from 'lucide-react';
import { EmailAuthForm, PhoneAuthForm, SocialAuthButtons } from '@/components/auth';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

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
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
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
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
          <p>By continuing, you agree to our Terms of Service</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
