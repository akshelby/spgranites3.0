import { useEffect, useState } from 'react';
import { AdminLayout, PageHeader } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { api } from '@/lib/api';
import { Profile } from '@/types/database';
import { CRMDetailPanel } from '@/components/admin/crm/CRMDetailPanel';
import { Search, User, ShoppingCart, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerWithStats extends Profile {
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const [profiles, orders] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/orders'),
      ]);

      const ordersByUser: Record<string, { count: number; total: number; lastDate: string | null }> = {};
      (orders || []).forEach((o: any) => {
        if (!ordersByUser[o.user_id]) {
          ordersByUser[o.user_id] = { count: 0, total: 0, lastDate: null };
        }
        ordersByUser[o.user_id].count++;
        ordersByUser[o.user_id].total += Number(o.total_amount) || 0;
        if (!ordersByUser[o.user_id].lastDate || o.created_at > ordersByUser[o.user_id].lastDate!) {
          ordersByUser[o.user_id].lastDate = o.created_at;
        }
      });

      const enriched: CustomerWithStats[] = (profiles || []).map((p: any) => ({
        ...p,
        order_count: ordersByUser[p.user_id]?.count || 0,
        total_spent: ordersByUser[p.user_id]?.total || 0,
        last_order_date: ordersByUser[p.user_id]?.lastDate || null,
      }));

      setCustomers(enriched);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const openDetail = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Customers"
        description={`${customers.length} registered customers`}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <User className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{search ? 'No matching customers' : 'No customers yet'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
              onClick={() => openDetail(customer)}
            >
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {customer.full_name || customer.display_name || customer.email || 'Unknown'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {customer.phone && <span>{customer.phone}</span>}
                    {customer.city && <span>{customer.city}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  {customer.order_count > 0 ? (
                    <>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {customer.order_count} orders
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ₹{customer.total_spent.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">No orders</Badge>
                  )}
                </div>
                <div className="sm:hidden shrink-0">
                  {customer.order_count > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {customer.order_count} orders
                    </Badge>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden">
          {selectedCustomer && (
            <CRMDetailPanel
              userId={selectedCustomer.user_id}
              info={{
                name: selectedCustomer.full_name || selectedCustomer.display_name || selectedCustomer.email || 'Unknown',
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
                city: selectedCustomer.city,
                company: selectedCustomer.company_name,
              }}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
