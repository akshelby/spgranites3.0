import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

interface EmailAuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
}

export function EmailAuthForm({ mode, onSuccess }: EmailAuthFormProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    try {
      if (mode === 'signup') {
        signUpSchema.parse({ email, password, confirmPassword });
      } else {
        signInSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !z.string().email().safeParse(resetEmail).success) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setResetSent(true);
      toast.success('Password reset link sent! Check your email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFormError(null);
    
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        setLoading(false);

        if (error) {
          if (error.message.includes('User already registered')) {
            setFormError('An account with this email already exists. Try signing in instead.');
          } else {
            setFormError(error.message);
          }
        } else {
          toast.success('Account created! Please check your email to verify your account.');
        }
      } else {
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setFormError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setFormError('Please verify your email before signing in. Check your inbox for a verification link.');
          } else {
            setFormError(error.message);
          }
        } else {
          toast.success('Signed in successfully!');
          onSuccess();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setFormError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>

        {resetSent ? (
          <div className="text-center space-y-3 py-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-lg">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <strong>{resetEmail}</strong>. Click the link in the email to set a new password.
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Forgot your password?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>{t('auth.email')}</Label>
        <div className="relative">
          <Mail className={`absolute left-3 top-3 h-4 w-4 ${formError ? 'text-destructive/60' : 'text-muted-foreground'}`} />
          <Input
            id={`${mode}-email`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
            className={`pl-10 ${formError ? 'border-destructive/50 focus-visible:ring-destructive/30' : ''}`}
            disabled={loading}
          />
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${mode}-password`}>{t('auth.password')}</Label>
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => { setShowForgotPassword(true); setResetEmail(email); }}
              className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>
        <PasswordInput
          id={`${mode}-password`}
          value={password}
          onChange={(val) => { setPassword(val); setFormError(null); }}
          disabled={loading}
          error={errors.password}
        />
      </div>

      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            disabled={loading}
            error={errors.confirmPassword}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'signup' ? t('auth.creatingAccount') : t('auth.signingIn')}
          </>
        ) : (
          mode === 'signup' ? t('auth.signUp') : t('auth.signIn')
        )}
      </Button>
    </form>
  );
}
