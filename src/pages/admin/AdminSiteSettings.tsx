import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettingsContext } from '@/contexts/SiteSettingsContext';
import { SPLoader } from '@/components/ui/SPLoader';
import { Save, Phone, Mail, MapPin, Clock, Share2, Building2 } from 'lucide-react';

interface SettingsForm {
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

export default function AdminSiteSettings() {
  const { toast } = useToast();
  const { token } = useAuth();
  const { refetch: refetchGlobalSettings } = useSiteSettingsContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsForm>({
    phone_primary: '',
    phone_secondary: '',
    whatsapp_number: '',
    email_primary: '',
    email_secondary: '',
    address_line1: '',
    address_line2: '',
    working_hours_weekday: '',
    working_hours_sunday: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_youtube: '',
    company_name: '',
    company_tagline: '',
    map_embed_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      setForm(prev => ({ ...prev, ...data }));
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Saved changes', duration: 3000 });
        await refetchGlobalSettings();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save settings.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const updateField = (key: keyof SettingsForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <AdminLayout><SPLoader size="lg" text="Loading settings..." fullPage /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader
        title="Site Settings"
        description="Manage your website's contact details, address, and social media links"
      />

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name</label>
                <Input value={form.company_name} onChange={e => updateField('company_name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tagline</label>
                <Input value={form.company_tagline} onChange={e => updateField('company_tagline', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5 text-primary" />
              Phone Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Primary Phone</label>
                <Input value={form.phone_primary} onChange={e => updateField('phone_primary', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Secondary Phone</label>
                <Input value={form.phone_secondary} onChange={e => updateField('phone_secondary', e.target.value)} placeholder="+91 98765 43211" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">WhatsApp Number (without + or spaces, e.g. 919876543210)</label>
              <Input value={form.whatsapp_number} onChange={e => updateField('whatsapp_number', e.target.value)} placeholder="919876543210" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-primary" />
              Email Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Primary Email</label>
                <Input type="email" value={form.email_primary} onChange={e => updateField('email_primary', e.target.value)} placeholder="info@spgranites.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Secondary Email</label>
                <Input type="email" value={form.email_secondary} onChange={e => updateField('email_secondary', e.target.value)} placeholder="sales@spgranites.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-primary" />
              Business Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Address Line 1</label>
              <Input value={form.address_line1} onChange={e => updateField('address_line1', e.target.value)} placeholder="123 Stone Avenue, Industrial Area" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address Line 2 (City, State, PIN)</label>
              <Input value={form.address_line2} onChange={e => updateField('address_line2', e.target.value)} placeholder="Chennai, Tamil Nadu 600001" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Google Maps Embed URL</label>
              <Input value={form.map_embed_url} onChange={e => updateField('map_embed_url', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Weekday Hours</label>
                <Input value={form.working_hours_weekday} onChange={e => updateField('working_hours_weekday', e.target.value)} placeholder="Mon - Sat: 9:00 AM - 7:00 PM" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sunday / Holiday</label>
                <Input value={form.working_hours_sunday} onChange={e => updateField('working_hours_sunday', e.target.value)} placeholder="Sunday: Closed" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-5 w-5 text-primary" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Facebook</label>
                <Input value={form.social_facebook} onChange={e => updateField('social_facebook', e.target.value)} placeholder="https://facebook.com/spgranites" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instagram</label>
                <Input value={form.social_instagram} onChange={e => updateField('social_instagram', e.target.value)} placeholder="https://instagram.com/spgranites" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Twitter / X</label>
                <Input value={form.social_twitter} onChange={e => updateField('social_twitter', e.target.value)} placeholder="https://twitter.com/spgranites" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">YouTube</label>
                <Input value={form.social_youtube} onChange={e => updateField('social_youtube', e.target.value)} placeholder="https://youtube.com/@spgranites" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
