import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Estimation {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  project_types: string[] | null;
  project_nature: string | null;
  stone_type: string | null;
  budget_range: string | null;
  status: string;
  estimated_amount: number | null;
  admin_notes: string | null;
  created_at: string;
}

export default function AdminEstimations() {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimation, setSelectedEstimation] = useState<Estimation | null>(null);
  const [editData, setEditData] = useState({ status: '', estimated_amount: '', admin_notes: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchEstimations();
  }, []);

  const fetchEstimations = async () => {
    try {
      const { data, error } = await supabase
        .from('estimation_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstimations(data || []);
    } catch (error) {
      console.error('Error fetching estimations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (estimation: Estimation) => {
    setSelectedEstimation(estimation);
    setEditData({
      status: estimation.status,
      estimated_amount: estimation.estimated_amount?.toString() || '',
      admin_notes: estimation.admin_notes || '',
    });
  };

  const handleUpdate = async () => {
    if (!selectedEstimation) return;

    try {
      const { error } = await supabase
        .from('estimation_enquiries')
        .update({
          status: editData.status,
          estimated_amount: editData.estimated_amount ? parseFloat(editData.estimated_amount) : null,
          admin_notes: editData.admin_notes || null,
        })
        .eq('id', selectedEstimation.id);

      if (error) throw error;
      toast({ title: 'Estimation updated' });
      setSelectedEstimation(null);
      fetchEstimations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const columns = [
    {
      key: 'full_name',
      header: 'Customer',
      render: (est: Estimation) => (
        <div>
          <p className="font-medium">{est.full_name}</p>
          <p className="text-sm text-muted-foreground">{est.mobile_number}</p>
        </div>
      ),
    },
    {
      key: 'project_types',
      header: 'Project',
      render: (est: Estimation) => (
        <div>
          <p className="text-sm">{est.project_types?.join(', ') || '-'}</p>
          <p className="text-xs text-muted-foreground">{est.stone_type || '-'}</p>
        </div>
      ),
    },
    {
      key: 'budget_range',
      header: 'Budget',
      render: (est: Estimation) => (
        <p className="text-sm">{est.budget_range || '-'}</p>
      ),
    },
    {
      key: 'estimated_amount',
      header: 'Quote',
      render: (est: Estimation) => (
        <p className="font-medium">
          {est.estimated_amount ? `₹${est.estimated_amount.toLocaleString()}` : '-'}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (est: Estimation) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(est.status)}`}>
          {est.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (est: Estimation) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(est.created_at), 'MMM d, yyyy')}
        </p>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (est: Estimation) => (
        <Button variant="ghost" size="icon" onClick={() => handleView(est)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Estimation Enquiries"
        description="Manage project estimation requests"
      />

      <DataTable
        columns={columns}
        data={estimations}
        loading={loading}
        emptyMessage="No estimation requests yet"
      />

      <Dialog open={!!selectedEstimation} onOpenChange={() => setSelectedEstimation(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Estimation Details</DialogTitle>
          </DialogHeader>
          {selectedEstimation && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${selectedEstimation.mobile_number}`}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  {selectedEstimation.mobile_number}
                </a>
                {selectedEstimation.email && (
                  <a
                    href={`mailto:${selectedEstimation.email}`}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedEstimation.email}
                  </a>
                )}
              </div>

              <div className="grid gap-3 rounded-lg border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Types</span>
                  <span>{selectedEstimation.project_types?.join(', ') || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nature</span>
                  <span>{selectedEstimation.project_nature || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stone Type</span>
                  <span>{selectedEstimation.stone_type || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Range</span>
                  <span>{selectedEstimation.budget_range || '-'}</span>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Amount (₹)</Label>
                  <Input
                    type="number"
                    value={editData.estimated_amount}
                    onChange={(e) => setEditData({ ...editData, estimated_amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={editData.admin_notes}
                    onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedEstimation(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
