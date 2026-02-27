import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface SiteSettings {
  phone_primary: string;
  phone_secondary: string;
  whatsapp_number: string;
  email_primary: string;
  email_secondary: string;
  address_line1: string;
  address_line2: string;
  working_hours_weekday: string;
  working_hours_sunday: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_youtube: string;
  company_name: string;
  company_tagline: string;
  map_embed_url: string;
}

const defaultSettings: SiteSettings = {
  phone_primary: '+91 98765 43210',
  phone_secondary: '+91 98765 43211',
  whatsapp_number: '919876543210',
  email_primary: 'info@spgranites.com',
  email_secondary: 'sales@spgranites.com',
  address_line1: '123 Stone Avenue, Industrial Area',
  address_line2: 'Chennai, Tamil Nadu 600001',
  working_hours_weekday: 'Mon - Sat: 9:00 AM - 7:00 PM',
  working_hours_sunday: 'Sunday: Closed',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_twitter: 'https://twitter.com',
  social_youtube: 'https://youtube.com',
  company_name: 'SP Granites',
  company_tagline: 'Premium Stone Works',
  map_embed_url: '',
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: defaultSettings,
  refetch: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const { settings } = useContext(SiteSettingsContext);
  return settings;
}

export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext);
}
