import { Phone, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface PhoneAuthFormProps {
  onSuccess: () => void;
  showTestHint?: boolean;
}

export function PhoneAuthForm({ onSuccess, showTestHint = true }: PhoneAuthFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-medium text-lg">Phone Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Phone authentication is coming soon. Please use email to sign in for now.
        </p>
      </div>

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Phone OTP authentication will be available in a future update. In the meantime, please use the Email tab to create an account or sign in.
        </AlertDescription>
      </Alert>
    </div>
  );
}
