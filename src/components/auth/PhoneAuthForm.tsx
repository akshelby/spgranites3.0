import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Phone, MessageCircle, ArrowLeft } from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX)'),
});

interface PhoneAuthFormProps {
  onSuccess: () => void;
}

type OtpChannel = 'sms' | 'whatsapp';

export function PhoneAuthForm({ onSuccess }: PhoneAuthFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<OtpChannel>('sms');
  const [error, setError] = useState('');

  const validatePhone = () => {
    try {
      phoneSchema.parse({ phone });
      setError('');
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSendOtp = async (selectedChannel: OtpChannel) => {
    if (!validatePhone()) return;

    setLoading(true);
    setChannel(selectedChannel);

    try {
      // Format phone number with + if not present
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: selectedChannel,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setStep('otp');
        toast.success(`OTP sent via ${selectedChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`);
      }
    } catch (err) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setError('Invalid OTP. Please try again.');
        toast.error('Invalid OTP');
      } else {
        toast.success('Signed in successfully!');
        onSuccess();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    handleSendOtp(channel);
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <h3 className="font-medium">Enter verification code</h3>
          <p className="text-sm text-muted-foreground">
            We sent a code to {phone} via {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button
          type="button"
          className="w-full"
          onClick={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full"
          onClick={handleResendOtp}
          disabled={loading}
        >
          Didn't receive code? Resend
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +91 for India)
        </p>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          onClick={() => handleSendOtp('sms')}
          disabled={loading}
        >
          {loading && channel === 'sms' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              Send OTP via SMS
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSendOtp('whatsapp')}
          disabled={loading}
        >
          {loading && channel === 'whatsapp' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send OTP via WhatsApp
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
