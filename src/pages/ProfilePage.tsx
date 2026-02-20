import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Lock, Plus, Trash2, Edit, Home, Building2, MapPinned, Star, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Address } from '@/types/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  alternate_phone: z.string().optional(),
  company_name: z.string().optional(),
  gst_number: z.string().optional(),
});

const addressSchema = z.object({
  label: z.string().optional(),
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  address_line_1: z.string().min(5, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  address_type: z.enum(['home', 'office', 'other']).optional(),
  is_default: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addressTypeOptions = useMemo(() => [
    { value: 'home' as const, label: t('cart.home'), icon: Home },
    { value: 'office' as const, label: t('cart.office'), icon: Building2 },
    { value: 'other' as const, label: t('cart.other'), icon: MapPinned },
  ], [t]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      alternate_phone: '',
      company_name: '',
      gst_number: '',
    },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home',
      is_default: false,
    },
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('addresses').select('*').eq('user_id', user!.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
        profileForm.reset({
          full_name: profileRes.data.full_name || '',
          phone: profileRes.data.phone || '',
          alternate_phone: profileRes.data.alternate_phone || '',
          company_name: profileRes.data.company_name || '',
          gst_number: profileRes.data.gst_number || '',
        });
      }
      if (addressRes.data) setAddresses(addressRes.data as Address[]);
    } catch {}
    setLoading(false);
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update(data).eq('user_id', user!.id).select().single();
      if (error) throw error;
      toast.success(t('profile.profileUpdated'));
    } catch {
      toast.error(t('profile.profileFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        const { error } = await supabase.from('addresses').update({ ...data, country: 'India' }).eq('id', editingAddress.id).eq('user_id', user!.id).select().single();
        if (error) throw error;
        toast.success(t('profile.addressUpdated'));
      } else {
        const isFirst = addresses.length === 0;
        const insertData: any = {
          ...data,
          country: 'India',
          is_default: isFirst ? true : data.is_default,
          user_id: user!.id,
        };
        const { error } = await supabase.from('addresses').insert(insertData).select().single();
        if (error) throw error;
        toast.success(t('profile.addressAdded'));
      }
      setAddressDialogOpen(false);
      setEditingAddress(null);
      addressForm.reset({
        label: '',
        full_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        address_type: 'home',
        is_default: false,
      });
      fetchData();
    } catch {
      toast.error(t('profile.addressSaveFailed'));
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user!.id);
      if (error) throw error;
      toast.success(t('profile.addressDeleted'));
      fetchData();
    } catch {
      toast.error(t('profile.addressDeleteFailed'));
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user!.id).select().single();
      if (error) throw error;
      toast.success(t('profile.defaultUpdated'));
      fetchData();
    } catch {
      toast.error(t('profile.defaultFailed'));
    }
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({
      label: address.label || '',
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type || 'home',
      is_default: address.is_default,
    });
    setAddressDialogOpen(true);
  };

  const openNewAddress = () => {
    setEditingAddress(null);
    addressForm.reset({
      label: '',
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home',
      is_default: false,
    });
    setAddressDialogOpen(true);
  };

  const getAddressTypeIcon = (type?: string) => {
    switch (type) {
      case 'office': return Building2;
      case 'other': return MapPinned;
      default: return Home;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <SPLoader size="lg" text="Loading profile..." fullPage />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-6" data-testid="text-profile-title">
          {t('profile.title')}
        </h1>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-1.5" />
              {t('profile.profile')}
            </TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">
              <MapPin className="h-4 w-4 mr-1.5" />
              {t('profile.addresses')} ({addresses.length})
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Lock className="h-4 w-4 mr-1.5" />
              {t('profile.security')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t('profile.personalInfo')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('profile.personalInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 sm:space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={profileForm.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.fullName')}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-profile-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.phone')}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-profile-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="company_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.companyName')}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-profile-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="gst_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.gstNumber')}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-profile-gst" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" disabled={saving} data-testid="button-save-profile">
                      {saving ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">{t('profile.savedAddresses')}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.manageAddresses')}</p>
                </div>
                <Button size="sm" onClick={openNewAddress} data-testid="button-add-address">
                  <Plus className="h-4 w-4 mr-1.5" />
                  {t('profile.addNewAddress')}
                </Button>
              </div>

              {addresses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">{t('profile.noAddresses')}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {t('profile.noAddressesHint')}
                    </p>
                    <Button size="sm" onClick={openNewAddress} data-testid="button-add-first-address">
                      <Plus className="h-4 w-4 mr-1.5" />
                      {t('profile.addAddress')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map((address) => {
                    const TypeIcon = getAddressTypeIcon(address.address_type);
                    return (
                      <Card
                        key={address.id}
                        className={cn(
                          'relative',
                          address.is_default && 'border-primary/50'
                        )}
                        data-testid={`card-address-${address.id}`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                                address.address_type === 'office' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                                address.address_type === 'other' ? 'bg-purple-100 dark:bg-purple-900/30' : 
                                'bg-green-100 dark:bg-green-900/30'
                              )}>
                                <TypeIcon className={cn(
                                  'h-3.5 w-3.5',
                                  address.address_type === 'office' ? 'text-blue-600 dark:text-blue-400' :
                                  address.address_type === 'other' ? 'text-purple-600 dark:text-purple-400' :
                                  'text-green-600 dark:text-green-400'
                                )} />
                              </div>
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                  {address.label || address.address_type || t('cart.home')}
                                </span>
                                {address.is_default && (
                                  <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                    {t('profile.default')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm font-medium">{address.full_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('common.phone')}: {address.phone}
                          </p>

                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditAddress(address)}
                              data-testid={`button-edit-address-${address.id}`}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              {t('profile.edit')}
                            </Button>
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDefaultAddress(address.id!)}
                                data-testid={`button-default-address-${address.id}`}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {t('profile.setDefault')}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => deleteAddress(address.id!)}
                              data-testid={`button-delete-address-${address.id}`}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {t('profile.delete')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Card
                    className="border-dashed hover-elevate cursor-pointer"
                    onClick={openNewAddress}
                    data-testid="card-add-new-address"
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[140px]">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{t('profile.addNewAddress')}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <Dialog open={addressDialogOpen} onOpenChange={(open) => {
              setAddressDialogOpen(open);
              if (!open) {
                setEditingAddress(null);
                addressForm.reset();
              }
            }}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    {editingAddress ? t('profile.editAddress') : t('profile.addNewAddressTitle')}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {editingAddress ? t('profile.editAddressDesc') : t('profile.addAddressDesc')}
                  </DialogDescription>
                </DialogHeader>
                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                    <FormField
                      control={addressForm.control}
                      name="address_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('cart.addressType')}</FormLabel>
                          <div className="flex gap-2">
                            {addressTypeOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-colors',
                                  field.value === opt.value
                                    ? 'border-primary bg-primary/5 font-medium'
                                    : 'border-border'
                                )}
                                data-testid={`button-type-${opt.value}`}
                              >
                                <opt.icon className="h-3.5 w-3.5" />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('cart.label')}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mom's House, Site Office" {...field} data-testid="input-address-label" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={addressForm.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('cart.fullName')} *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('cart.phone')} *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addressForm.control}
                      name="address_line_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('cart.addressLine1')} *</FormLabel>
                          <FormControl>
                            <Input placeholder="House/Flat No., Building, Street" {...field} data-testid="input-address-line1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="address_line_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('cart.addressLine2')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Area, Landmark (optional)" {...field} data-testid="input-address-line2" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('cart.city')} *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('cart.state')} *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('cart.pincode')} *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address-pincode" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addressForm.control}
                      name="is_default"
                      render={({ field }) => (
                        <FormItem>
                          <div
                            className={cn(
                              'flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors',
                              field.value ? 'border-primary bg-primary/5' : 'border-border'
                            )}
                            onClick={() => field.onChange(!field.value)}
                            data-testid="toggle-default-address"
                          >
                            <div className={cn(
                              'w-4 h-4 rounded-sm border flex items-center justify-center shrink-0',
                              field.value ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                            )}>
                              {field.value && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{t('cart.setAsDefault')}</span>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-save-address">
                      {editingAddress ? t('cart.updateAddress') : t('cart.saveAddress')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t('profile.security')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('profile.signOutDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm mb-1">{t('auth.email')}</h4>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-sm mb-1">{t('profile.signOut')}</h4>
                  <p className="text-muted-foreground text-xs mb-4">
                    {t('profile.signOutDesc')}
                  </p>
                  <Button variant="outline" onClick={signOut} data-testid="button-signout">
                    {t('profile.signOutButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
