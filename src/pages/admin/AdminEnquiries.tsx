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
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, Trash2, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnquiries();
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          toast({ title: 'Loading timeout', description: 'Data is taking too long to load. Please try refreshing.', variant: 'destructive' });
        }
        return false;
      });
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchEnquiries = async () => {
    try {
      const data = await api.get('/api/admin/enquiries');
      setEnquiries(data || []);
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      toast({ title: 'Error loading data', description: error?.message || 'Please try refreshing the page.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/admin/enquiries/${id}`, { is_read: true });
      toast({ title: 'Marked as read' });
      fetchEnquiries();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await api.delete(`/api/admin/enquiries/${id}`);
      toast({ title: 'Enquiry deleted' });
      fetchEnquiries();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const viewEnquiry = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.is_read) {
      await markAsRead(enquiry.id);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Contact',
      render: (enquiry: Enquiry) => (
        <div className="flex items-center gap-2">
          {!enquiry.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <div>
            <p className="font-medium">{enquiry.name}</p>
            <p className="text-sm text-muted-foreground">{enquiry.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (enquiry: Enquiry) => (
        <p className="max-w-md truncate text-sm text-muted-foreground">
          {enquiry.message}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (enquiry: Enquiry) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(enquiry.created_at), 'MMM d, yyyy')}
        </p>
      ),
    },
    {
      key: 'is_read',
      header: 'Status',
      render: (enquiry: Enquiry) => (
        <Badge variant={enquiry.is_read ? 'secondary' : 'default'}>
          {enquiry.is_read ? 'Read' : 'New'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (enquiry: Enquiry) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => viewEnquiry(enquiry)}>
            <Eye className="h-4 w-4" />
          </Button>
          {!enquiry.is_read && (
            <Button variant="ghost" size="icon" onClick={() => markAsRead(enquiry.id)}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleDelete(enquiry.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Enquiries"
        description="View and manage contact form submissions"
      />

      <DataTable
        columns={columns}
        data={enquiries}
        loading={loading}
        emptyMessage="No enquiries yet"
      />

      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{selectedEnquiry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedEnquiry.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  {selectedEnquiry.phone}
                </a>
                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedEnquiry.email}
                  </a>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="mt-2 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
