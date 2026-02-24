import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin, Home, Building2, MapPinned, Check, Edit, X, CheckCircle, Tag, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Address } from '@/types/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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

type AddressFormData = z.infer<typeof addressSchema>;

export default function CartPage() {
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const addressTypeOptions = [
    { value: 'home' as const, label: t('cart.home'), icon: Home },
    { value: 'office' as const, label: t('cart.office'), icon: Building2 },
    { value: 'other' as const, label: t('cart.other'), icon: MapPinned },
  ];
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', state: '', pincode: '', address_type: 'home', is_default: false },
  });

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });
      if (data) {
        setAddresses(data as any);
        const defaultAddr = data.find((a: any) => a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    } catch {}
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        const { error } = await supabase.from('addresses').update({ ...data, country: 'India' } as any).eq('id', editingAddress.id);
        if (error) throw error;
        toast.success(t('cart.addressUpdated'));
      } else {
        const isFirst = addresses.length === 0;
        const { data: newAddr, error } = await supabase
          .from('addresses')
          .insert({ ...data, country: 'India', is_default: isFirst ? true : data.is_default, user_id: user!.id } as any)
          .select()
          .single();
        if (error) throw error;
        toast.success(t('cart.addressAdded'));
        if (newAddr) setSelectedAddressId(newAddr.id);
      }
      setAddressDialogOpen(false);
      setEditingAddress(null);
      addressForm.reset();
      fetchAddresses();
    } catch {
      toast.error(t('cart.addressSaveFailed'));
    }
  };

  const openNewAddress = () => {
    setEditingAddress(null);
    addressForm.reset({ label: '', full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', state: '', pincode: '', address_type: 'home', is_default: false });
    setAddressDialogOpen(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({
      label: address.label || '', full_name: address.full_name, phone: address.phone,
      address_line_1: address.address_line_1, address_line_2: address.address_line_2 || '',
      city: address.city, state: address.state, pincode: address.pincode,
      address_type: address.address_type || 'home', is_default: address.is_default,
    });
    setAddressDialogOpen(true);
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('cart.addressRemoved'));
      await fetchAddresses();
    } catch {
      toast.error(t('cart.addressDeleteFailed'));
    }
  };

  const getAddressTypeIcon = (type?: string) => {
    switch (type) {
      case 'office': return Building2;
      case 'other': return MapPinned;
      default: return Home;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const subtotal = getCartTotal();
  const totalSavings = items.reduce((acc, item) => {
    if (item.comparePrice && item.comparePrice > item.price) return acc + (item.comparePrice - item.price) * item.quantity;
    return acc;
  }, 0);
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handleProceedToPayment = () => {
    if (!user) return;
    if (!selectedAddressId) { toast.error(t('cart.selectAddress')); return; }
    navigate(`/payment?address=${selectedAddressId}`);
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2" data-testid="text-empty-cart">{t('cart.empty')}</h1>
          <p className="text-sm text-muted-foreground mb-4">{t('cart.emptyHint')}</p>
          <Button asChild size="default" data-testid="button-browse-products">
            <Link to="/products">{t('cart.browseProducts')}</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-5" data-testid="text-cart-title">
          {t('cart.title')} ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            {items.map((item) => {
              const discount = item.comparePrice && item.comparePrice > item.price
                ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100) : 0;
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  className="p-3 sm:p-4 bg-card rounded-lg border border-border" data-testid={`card-cart-item-${item.productId}`}>
                  <div className="flex gap-3 sm:gap-4">
                    <Link to={`/products/${item.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" data-testid={`img-cart-item-${item.productId}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to={`/products/${item.productId}`} className="text-sm sm:text-base font-medium line-clamp-2 hover:underline" data-testid={`text-cart-name-${item.productId}`}>{item.name}</Link>
                          {item.category && (<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{item.category}</p>)}
                        </div>
                        <p className="text-sm sm:text-base font-bold shrink-0" data-testid={`text-item-total-${item.productId}`}>{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      {item.description && (<p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1" data-testid={`text-cart-desc-${item.productId}`}>{item.description}</p>)}
                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <span className="text-sm font-bold text-primary" data-testid={`text-cart-price-${item.productId}`}>{formatPrice(item.price)}</span>
                        {item.unit && (<span className="text-[10px] text-muted-foreground">{t('products.pricePerSqFt')}</span>)}
                        {item.comparePrice && item.comparePrice > item.price && (<span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(item.comparePrice)}</span>)}
                        {discount > 0 && (<Badge variant="secondary" className="text-[11px] sm:text-[10px] px-1.5 py-0">{discount}% {t('common.off')}</Badge>)}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mt-1">
                        {item.inStock !== false && (
                          <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5" data-testid={`text-stock-${item.productId}`}>
                            <CheckCircle className="h-3 w-3" />{t('products.inStock')}
                          </span>
                        )}
                        {subtotal > 10000 && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5"><Truck className="h-3 w-3" />{t('cart.free')} {t('cart.shipping')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border rounded-md">
                          <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} data-testid={`button-qty-minus-${item.productId}`}><Minus className="h-3 w-3" /></Button>
                          <span className="w-7 text-center text-xs font-medium" data-testid={`text-qty-${item.productId}`}>{item.quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} data-testid={`button-qty-plus-${item.productId}`}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeFromCart(item.id)} data-testid={`button-remove-${item.productId}`}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />{t('cart.remove')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1.5"><MapPin className="h-4 w-4" />{t('cart.deliveryAddress')}</CardTitle>
                {user && (
                  <Button variant="outline" size="sm" onClick={openNewAddress} data-testid="button-add-address-cart">
                    <Plus className="h-3.5 w-3.5 mr-1" />{t('cart.addNew')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-xs mb-2">{t('cart.signInForAddress')}</p>
                    <Button variant="outline" size="sm" asChild data-testid="button-signin-address"><Link to="/auth">{t('auth.signIn')}</Link></Button>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium mb-1">{t('cart.noAddresses')}</p>
                    <p className="text-muted-foreground text-xs mb-3">{t('cart.noAddressesHint')}</p>
                    <Button size="sm" onClick={openNewAddress} data-testid="button-add-first-address-cart"><Plus className="h-3.5 w-3.5 mr-1" />{t('cart.addAddress')}</Button>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-2">
                    {addresses.map((address) => {
                      const TypeIcon = getAddressTypeIcon(address.address_type);
                      const isSelected = selectedAddressId === address.id;
                      return (
                        <div key={address.id} className={cn('relative p-2.5 rounded-md border cursor-pointer transition-colors', isSelected ? 'border-primary bg-primary/5' : 'border-border')}
                          onClick={() => setSelectedAddressId(address.id!)} data-testid={`radio-address-${address.id}`}>
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value={address.id!} id={address.id} className="mt-0.5" />
                            <Label htmlFor={address.id} className="cursor-pointer flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <TypeIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{address.label || address.address_type || t('cart.home')}</span>
                                {address.is_default && (<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{t('profile.default')}</span>)}
                              </div>
                              <p className="text-xs font-medium">{address.full_name}</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                {address.address_line_1}{address.address_line_2 && `, ${address.address_line_2}`}, {address.city} - {address.pincode}
                              </p>
                            </Label>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openEditAddress(address); }} data-testid={`button-edit-addr-${address.id}`}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteAddress(address.id!); }} data-testid={`button-delete-addr-${address.id}`}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1.5"><Tag className="h-4 w-4" />{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                {totalSavings > 0 && (<div className="flex justify-between text-xs sm:text-sm"><span className="text-green-600 dark:text-green-400">{t('cart.savings')}</span><span className="text-green-600 dark:text-green-400">-{formatPrice(totalSavings)}</span></div>)}
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.free') : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">{t('cart.tax')}</span><span>{formatPrice(tax)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-sm sm:text-base"><span>{t('cart.total')}</span><span className="text-primary">{formatPrice(total)}</span></div>
                {user ? (
                  <Button className="w-full mt-2" onClick={handleProceedToPayment} disabled={!selectedAddressId} data-testid="button-proceed-payment">
                    {t('cart.proceedToPayment')} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button className="w-full mt-2" asChild data-testid="button-signin-checkout"><Link to="/auth">{t('cart.signInToCheckout')}</Link></Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? t('cart.editAddress') : t('cart.addNewAddress')}</DialogTitle>
              <DialogDescription>{editingAddress ? t('cart.editAddressDesc') : t('cart.addAddressDesc')}</DialogDescription>
            </DialogHeader>
            <Form {...addressForm}>
              <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-3">
                <div className="flex gap-2">
                  {addressTypeOptions.map((opt) => (
                    <Button key={opt.value} type="button" variant={addressForm.watch('address_type') === opt.value ? 'default' : 'outline'} size="sm"
                      onClick={() => addressForm.setValue('address_type', opt.value)}>
                      <opt.icon className="h-3.5 w-3.5 mr-1" />{opt.label}
                    </Button>
                  ))}
                </div>
                <FormField control={addressForm.control} name="label" render={({ field }) => (<FormItem><FormLabel>{t('profile.label')}</FormLabel><FormControl><Input placeholder="e.g. Mom's House" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>{t('profile.fullName')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('profile.phone')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="address_line_1" render={({ field }) => (<FormItem><FormLabel>{t('profile.addressLine1')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={addressForm.control} name="address_line_2" render={({ field }) => (<FormItem><FormLabel>{t('profile.addressLine2')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={addressForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t('profile.city')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={addressForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>{t('profile.state')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={addressForm.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>{t('profile.pincode')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" className="w-full">{editingAddress ? t('cart.updateAddress') : t('cart.saveAddress')}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
