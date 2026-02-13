import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Building,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lock,
  Loader2,
  Wallet,
  QrCode,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Address } from '@/types/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

const upiApps = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
  { id: 'bhim', name: 'BHIM', color: '#00796B' },
];

const popularBanks = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra' },
  { id: 'bob', name: 'Bank of Baroda' },
  { id: 'pnb', name: 'Punjab National Bank' },
  { id: 'canara', name: 'Canara Bank' },
];

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  const addressId = searchParams.get('address');

  const subtotal = getCartTotal();
  const totalSavings = items.reduce((acc, item) => {
    if (item.comparePrice && item.comparePrice > item.price) {
      return acc + (item.comparePrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (!user || items.length === 0) {
      navigate('/cart');
      return;
    }
    if (addressId) {
      supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single()
        .then(({ data }) => {
          if (data) setAddress(data as Address);
        });
    }
  }, [user, items, addressId, navigate]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!user || !addressId || !address) {
      toast.error(t('cart.selectAddress'));
      return;
    }

    if (paymentMethod === 'upi' && !upiId && !selectedUpiApp) {
      toast.error(t('payment.enterUpiId'));
      return;
    }
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error(t('payment.enterCardNumber'));
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error(t('payment.enterExpiry'));
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error(t('payment.enterCvv'));
        return;
      }
      if (!cardName) {
        toast.error(t('payment.enterCardName'));
        return;
      }
    }
    if (paymentMethod === 'netbanking' && !selectedBank) {
      toast.error(t('payment.selectBank'));
      return;
    }

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: '',
          subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: total,
          shipping_address: address as any,
          billing_address: address as any,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setPaymentSuccess(true);
      clearCart();

      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 2500);
    } catch {
      toast.error(t('cart.orderFailed'));
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
          >
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold mb-2" data-testid="text-payment-success">
              {t('payment.success')}
            </h1>
            <p className="text-muted-foreground mb-2">
              {t('payment.successMessage')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('payment.redirecting')}
            </p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) return null;

  const paymentMethods = [
    { id: 'upi' as const, label: t('payment.upi'), icon: Smartphone, desc: t('payment.upiDesc') },
    { id: 'card' as const, label: t('payment.card'), icon: CreditCard, desc: t('payment.cardDesc') },
    { id: 'netbanking' as const, label: t('payment.netBanking'), icon: Building, desc: t('payment.netBankingDesc') },
    { id: 'cod' as const, label: t('payment.cod'), icon: Truck, desc: t('payment.codDesc') },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} data-testid="button-back-to-cart">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-display font-bold" data-testid="text-payment-title">
            {t('payment.title')}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            {address && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{t('payment.deliverTo')}</p>
                      <p className="text-sm font-medium">{address.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                        , {address.city} - {address.pincode}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/cart" data-testid="link-change-address">{t('payment.change')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  {t('payment.selectMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-md border transition-colors text-center',
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover-elevate'
                      )}
                      data-testid={`button-method-${method.id}`}
                    >
                      <method.icon className={cn('h-5 w-5', paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>

                <Separator className="mb-4" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={paymentMethod}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {paymentMethod === 'upi' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">{t('payment.payViaUpiApp')}</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {upiApps.map((app) => (
                              <button
                                key={app.id}
                                onClick={() => {
                                  setSelectedUpiApp(app.id);
                                  setUpiId('');
                                }}
                                className={cn(
                                  'flex items-center gap-2 p-2.5 rounded-md border transition-colors',
                                  selectedUpiApp === app.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover-elevate'
                                )}
                                data-testid={`button-upi-${app.id}`}
                              >
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                  style={{ backgroundColor: app.color }}
                                >
                                  {app.name[0]}
                                </div>
                                <span className="text-xs font-medium truncate">{app.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Separator className="flex-1" />
                          <span className="text-xs text-muted-foreground">{t('payment.or')}</span>
                          <Separator className="flex-1" />
                        </div>

                        <div>
                          <Label htmlFor="upi-id" className="text-sm font-medium mb-1.5 block">
                            {t('payment.enterUpiIdLabel')}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="upi-id"
                              placeholder="yourname@upi"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setSelectedUpiApp('');
                              }}
                              data-testid="input-upi-id"
                            />
                            <Button variant="outline" size="icon" data-testid="button-upi-qr">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{t('payment.upiHint')}</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="card-number" className="text-sm font-medium mb-1.5 block">
                            {t('payment.cardNumber')}
                          </Label>
                          <div className="relative">
                            <Input
                              id="card-number"
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                              data-testid="input-card-number"
                            />
                            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="card-name" className="text-sm font-medium mb-1.5 block">
                            {t('payment.cardholderName')}
                          </Label>
                          <Input
                            id="card-name"
                            placeholder="JOHN DOE"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            data-testid="input-card-name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="card-expiry" className="text-sm font-medium mb-1.5 block">
                              {t('payment.expiry')}
                            </Label>
                            <Input
                              id="card-expiry"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              maxLength={5}
                              data-testid="input-card-expiry"
                            />
                          </div>
                          <div>
                            <Label htmlFor="card-cvv" className="text-sm font-medium mb-1.5 block">
                              {t('payment.cvv')}
                            </Label>
                            <Input
                              id="card-cvv"
                              placeholder="123"
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              maxLength={4}
                              data-testid="input-card-cvv"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-md">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="text-[10px] text-muted-foreground">
                            {t('payment.cardSecure')}
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium block">{t('payment.popularBanks')}</Label>
                        <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {popularBanks.map((bank) => (
                              <div
                                key={bank.id}
                                className={cn(
                                  'flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors',
                                  selectedBank === bank.id ? 'border-primary bg-primary/5' : 'border-border'
                                )}
                                onClick={() => setSelectedBank(bank.id)}
                                data-testid={`radio-bank-${bank.id}`}
                              >
                                <RadioGroupItem value={bank.id} id={bank.id} />
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                  <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <Label htmlFor={bank.id} className="text-xs font-medium cursor-pointer">
                                  {bank.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3 shrink-0" />
                          {t('payment.netBankingHint')}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                          <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{t('payment.codTitle')}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t('payment.codMessage')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {t('payment.codNote')}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm sm:text-base">{t('payment.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2">
                <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2" data-testid={`text-payment-item-${item.productId}`}>
                      <div className="w-8 h-8 bg-muted rounded overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Wallet className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t('cart.quantity')}: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between gap-1 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between gap-1 text-xs sm:text-sm text-green-600 dark:text-green-400">
                    <span>{t('cart.youSave')}</span>
                    <span>-{formatPrice(totalSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-1 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-600 dark:text-green-400' : ''}>
                    {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between gap-1 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{t('cart.tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <Separator />

                <div className="flex justify-between gap-1 font-semibold text-base sm:text-lg">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary" data-testid="text-payment-total">{formatPrice(total)}</span>
                </div>

                <Button
                  className="w-full"
                  size="default"
                  onClick={handlePayment}
                  disabled={isProcessing || !address}
                  data-testid="button-pay-now"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      {t('payment.processing')}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? t('payment.confirmOrder') : `${t('payment.payNow')} ${formatPrice(total)}`}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-[10px] text-muted-foreground">{t('payment.securePayment')}</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 bg-muted/30 rounded-md space-y-2">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3 shrink-0" />
                {t('payment.encryptedInfo')}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                {t('payment.refundPolicy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
