import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface ContactNumber {
  id: string;
  phone_number: string;
  label: string | null;
  is_active: boolean;
  display_order: number;
}

interface ContactNumbersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactNumbersDialog({ open, onOpenChange }: ContactNumbersDialogProps) {
  const { t } = useTranslation();
  const [numbers, setNumbers] = useState<ContactNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNumbers();
    }
  }, [open]);

  const fetchNumbers = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase.from('contact_numbers' as any).select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      if (data) {
        setNumbers(data as any as ContactNumber[]);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-contact-numbers">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" data-testid="text-contact-dialog-title">
            <Phone className="h-5 w-5 text-primary" />
            {t('contactDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              {t('common.error')}
            </p>
          ) : numbers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4" data-testid="text-no-numbers">
              {t('contactDialog.noNumbers')}
            </p>
          ) : (
            numbers.map((num) => (
              <a
                key={num.id}
                href={`tel:${num.phone_number.replace(/\s/g, '')}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover-elevate"
                data-testid={`link-call-${num.id}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground" data-testid={`text-phone-${num.id}`}>
                    {num.phone_number}
                  </p>
                  {num.label && (
                    <p className="text-xs text-muted-foreground" data-testid={`text-label-${num.id}`}>
                      {num.label}
                    </p>
                  )}
                </div>
              </a>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
