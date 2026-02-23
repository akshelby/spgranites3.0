import { useEffect, useState } from 'react';
import { AdminLayout, PageHeader } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { Lead } from '@/types/database';
import { CRMDetailPanel } from '@/components/admin/crm/CRMDetailPanel';
import { LeadForm } from '@/components/admin/crm/LeadForm';
import { Search, Plus, UserPlus, ChevronRight, Phone, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  contacted: { label: 'Contacted', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  interested: { label: 'Interested', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  quoted: { label: 'Quoted', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await api.get('/api/admin/leads');
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'contacted') updates.last_contacted_at = new Date().toISOString();

      await api.put(`/api/admin/leads/${id}`, updates);
      toast({ title: `Status updated to ${status}` });
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    try {
      await api.delete(`/api/admin/leads/${id}`);
      toast({ title: 'Lead deleted' });
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.full_name.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = leads.reduce((acc: Record<string, number>, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const openForm = (lead?: Lead) => {
    setEditingLead(lead || null);
    setFormOpen(true);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Leads"
        description={`${leads.length} total leads`}
        action={
          <Button onClick={() => openForm()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Lead</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({leads.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {config.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
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
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{search || statusFilter !== 'all' ? 'No matching leads' : 'No leads yet'}</p>
            {!search && statusFilter === 'all' && (
              <Button onClick={() => openForm()} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add your first lead
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const sc = statusConfig[lead.status] || statusConfig.new;
            return (
              <Card
                key={lead.id}
                className="cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
              >
                <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    onClick={() => openDetail(lead)}
                  >
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1" onClick={() => openDetail(lead)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{lead.full_name}</p>
                      <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      )}
                      {lead.source && <span className="capitalize">{lead.source}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Select
                      value={lead.status}
                      onValueChange={(v) => updateLeadStatus(lead.id, v)}
                    >
                      <SelectTrigger className="h-7 w-auto min-w-[80px] border-0 bg-transparent text-xs p-1 hidden sm:flex">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hidden sm:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        openForm(lead);
                      }}
                    >
                      <span className="text-xs">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hidden sm:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLead(lead.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground sm:hidden" onClick={() => openDetail(lead)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden">
          {selectedLead && (
            <CRMDetailPanel
              leadId={selectedLead.id}
              info={{
                name: selectedLead.full_name,
                email: selectedLead.email,
                phone: selectedLead.phone,
                status: selectedLead.status,
                source: selectedLead.source,
              }}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={editingLead}
            onSaved={() => {
              setFormOpen(false);
              fetchLeads();
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => openForm()}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </AdminLayout>
  );
}
