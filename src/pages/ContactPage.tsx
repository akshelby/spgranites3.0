import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone number required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  usePageTitle('Contact Us');
  const { t } = useTranslation();
  const settings = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phonePrimaryDigits = settings.phone_primary.replace(/\s+/g, '');
  const phoneSecondaryDigits = settings.phone_secondary.replace(/\s+/g, '');

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.visitUs'),
      details: [settings.address_line1, settings.address_line2],
    },
    {
      icon: Phone,
      title: t('contact.callUs'),
      details: [settings.phone_primary, settings.phone_secondary],
      links: [`tel:${phonePrimaryDigits}`, `tel:${phoneSecondaryDigits}`],
    },
    {
      icon: Mail,
      title: t('contact.emailUs'),
      details: [settings.email_primary, settings.email_secondary],
      links: [`mailto:${settings.email_primary}`, `mailto:${settings.email_secondary}`],
    },
    {
      icon: Clock,
      title: t('contact.workingHours'),
      details: [settings.working_hours_weekday, settings.working_hours_sunday],
    },
  ];

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('enquiries')
        .insert({
          name: data.name,
          email: data.email || null,
          phone: data.phone,
          message: data.message,
        });
      if (error) throw error;

      toast.success(t('contact.messageSent'));
      form.reset();
    } catch (error) {
      toast.error(t('contact.messageFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            {t('contact.label')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-contact-title"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-3 sm:space-y-4"
          >
            {contactInfo.map((info) => (
              <div key={info.title} className="flex gap-3" data-testid={`info-${info.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <info.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-0.5">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-xs sm:text-sm text-muted-foreground">
                      {info.links?.[i] ? (
                        <a
                          href={info.links[i]}
                          className="underline"
                        >
                          {detail}
                        </a>
                      ) : (
                        detail
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {settings.map_embed_url && (
              <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={settings.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('contact.sendMessage')}</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">{t('contact.yourName')}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">{t('contact.phoneNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">{t('contact.emailOptional')}</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">{t('contact.yourMessage')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('contact.messagePlaceholder')}
                            rows={4}
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="default" disabled={isSubmitting} data-testid="button-send-message">
                    {isSubmitting ? t('contact.sending') : t('contact.send')}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
