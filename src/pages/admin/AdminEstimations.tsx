import { useEffect, useState, useRef } from 'react';
import { AdminLayout, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  Phone,
  Mail,
  MapPin,
  Search,
  RefreshCw,
  Download,
  Play,
  Pause,
  Trash2,
  Volume2,
  FileText,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Estimation {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  project_location: string | null;
  project_types: string[] | null;
  project_type_other: string | null;
  project_nature: string | null;
  kitchen_type: string | null;
  number_of_counters: number | null;
  stone_type: string | null;
  preferred_color: string | null;
  finish_type: string | null;
  approximate_length: string | null;
  approximate_width: string | null;
  thickness: string | null;
  quantity: string | null;
  flooring_required: boolean | null;
  tile_size_preference: string | null;
  total_flooring_area: string | null;
  expected_start_date: string | null;
  completion_urgency: string | null;
  budget_range: string | null;
  cutouts_required: string[] | null;
  edge_profile_preference: string | null;
  additional_notes: string | null;
  drawing_data: string | null;
  voice_recording_url: string | null;
  voice_transcription: string | null;
  reference_images: string[] | null;
  status: string;
  estimated_amount: number | null;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-destructive/10 text-destructive',
    new: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    contacted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};

const formatLabel = (value: string | null) => {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Audio Player Component
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>
      <div className="flex-1 space-y-1">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export default function AdminEstimations() {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimation, setSelectedEstimation] = useState<Estimation | null>(null);
  const [editData, setEditData] = useState({ status: '', estimated_amount: '', admin_notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('details');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEstimations();
  }, []);

  const fetchEstimations = async (retry = 0): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimation_enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (retry < 2) {
          await new Promise(r => setTimeout(r, 1000));
          return fetchEstimations(retry + 1);
        }
        throw error;
      }
      setEstimations(data || []);
    } catch (error: any) {
      console.error('Error fetching estimations:', error);
      toast({ title: 'Error loading estimations', description: error?.message || 'Please try refreshing the page.', variant: 'destructive' });
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
    setActiveTab('details');
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
      toast({ title: 'Estimation updated successfully' });
      fetchEstimations();
    } catch (error: any) {
      toast({ title: 'Error updating', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this estimation?')) return;

    try {
      const { error } = await supabase
        .from('estimation_enquiries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Estimation deleted' });
      setSelectedEstimation(null);
      fetchEstimations();
    } catch (error: any) {
      toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
    }
  };

  const exportToPDF = async (estimation: Estimation) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Estimation Enquiry', pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, pageWidth / 2, 28, { align: 'center' });

    let yPos = 40;

    // Customer Info Section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Information', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const customerInfo = [
      ['Name', estimation.full_name],
      ['Mobile', estimation.mobile_number],
      ['Email', estimation.email || '-'],
      ['Location', estimation.project_location || '-'],
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [],
      body: customerInfo,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Project Details Section
    doc.setFontSize(14);
    doc.text('Project Details', 14, yPos);
    yPos += 8;

    const projectInfo = [
      ['Project Types', estimation.project_types?.join(', ') || '-'],
      ['Kitchen Type', formatLabel(estimation.kitchen_type)],
      ['Project Nature', formatLabel(estimation.project_nature)],
      ['Stone Type', formatLabel(estimation.stone_type)],
      ['Preferred Color', estimation.preferred_color || '-'],
      ['Finish Type', formatLabel(estimation.finish_type)],
      ['Thickness', estimation.thickness || '-'],
      ['Dimensions', `${estimation.approximate_length || '-'} x ${estimation.approximate_width || '-'}`],
      ['Budget Range', formatLabel(estimation.budget_range)],
      ['Urgency', formatLabel(estimation.completion_urgency)],
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [],
      body: projectInfo,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Additional Notes
    if (estimation.additional_notes) {
      doc.setFontSize(14);
      doc.text('Additional Notes', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(estimation.additional_notes, pageWidth - 28);
      doc.text(splitNotes, 14, yPos);
      yPos += splitNotes.length * 5 + 10;
    }

    // Admin Notes
    if (estimation.admin_notes) {
      doc.setFontSize(14);
      doc.text('Admin Notes', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      const splitAdminNotes = doc.splitTextToSize(estimation.admin_notes, pageWidth - 28);
      doc.text(splitAdminNotes, 14, yPos);
      yPos += splitAdminNotes.length * 5 + 10;
    }

    // Quote Info
    doc.setFontSize(14);
    doc.text('Quote Information', 14, yPos);
    yPos += 8;

    const quoteInfo = [
      ['Status', formatLabel(estimation.status)],
      ['Estimated Amount', estimation.estimated_amount ? `₹${estimation.estimated_amount.toLocaleString()}` : 'Not quoted'],
      ['Enquiry Date', format(new Date(estimation.created_at), 'PPP')],
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [],
      body: quoteInfo,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      margin: { left: 14 },
    });

    // Add drawing if exists
    if (estimation.drawing_data) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Project Drawing', 14, 20);
      try {
        doc.addImage(estimation.drawing_data, 'PNG', 14, 30, pageWidth - 28, 100);
      } catch (e) {
        console.error('Error adding drawing to PDF:', e);
      }
    }

    // Save
    doc.save(`estimation-${estimation.full_name.replace(/\s+/g, '-')}-${format(new Date(estimation.created_at), 'yyyy-MM-dd')}.pdf`);
  };

  // Filter estimations
  const filteredEstimations = estimations.filter((est) => {
    const matchesSearch =
      est.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.mobile_number.includes(searchQuery) ||
      (est.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (est.project_location?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || est.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Estimation Enquiries"
        description="Manage project estimation requests"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => fetchEstimations()}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Project Types</TableHead>
              <TableHead>Stone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Voice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredEstimations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No estimation requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredEstimations.map((est) => (
                <TableRow key={est.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{est.full_name}</p>
                      <p className="text-sm text-muted-foreground">{est.mobile_number}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{est.project_location || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {est.project_types?.slice(0, 2).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {(est.project_types?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(est.project_types?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatLabel(est.stone_type)}</p>
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(est.status))}>
                      {formatLabel(est.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {est.voice_recording_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          handleView(est);
                          setActiveTab('media');
                        }}
                      >
                        <Mic className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(est.created_at), 'MMM d, yyyy')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(est)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => exportToPDF(est)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(est.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedEstimation} onOpenChange={() => setSelectedEstimation(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimation Details</DialogTitle>
          </DialogHeader>
          {selectedEstimation && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="drawing">
                  <FileText className="h-4 w-4 mr-2" />
                  Drawing
                </TabsTrigger>
                <TabsTrigger value="media">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Customer Info */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Customer Information</h4>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`tel:${selectedEstimation.mobile_number}`}
                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm hover:bg-muted/80"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedEstimation.mobile_number}
                      </a>
                      {selectedEstimation.email && (
                        <a
                          href={`mailto:${selectedEstimation.email}`}
                          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm hover:bg-muted/80"
                        >
                          <Mail className="h-4 w-4" />
                          {selectedEstimation.email}
                        </a>
                      )}
                      {selectedEstimation.project_location && (
                        <span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {selectedEstimation.project_location}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Details Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold">Project Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Project Types</span>
                          <span>{selectedEstimation.project_types?.join(', ') || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nature</span>
                          <span>{formatLabel(selectedEstimation.project_nature)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kitchen Type</span>
                          <span>{formatLabel(selectedEstimation.kitchen_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Counters</span>
                          <span>{selectedEstimation.number_of_counters || '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold">Stone & Finish</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stone Type</span>
                          <span>{formatLabel(selectedEstimation.stone_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color</span>
                          <span>{selectedEstimation.preferred_color || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Finish</span>
                          <span>{formatLabel(selectedEstimation.finish_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Thickness</span>
                          <span>{selectedEstimation.thickness || '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold">Dimensions & Quantity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Length</span>
                          <span>{selectedEstimation.approximate_length || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width</span>
                          <span>{selectedEstimation.approximate_width || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>{selectedEstimation.quantity || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Edge Profile</span>
                          <span>{selectedEstimation.edge_profile_preference || '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold">Timeline & Budget</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Date</span>
                          <span>
                            {selectedEstimation.expected_start_date
                              ? format(new Date(selectedEstimation.expected_start_date), 'PPP')
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Urgency</span>
                          <span>{formatLabel(selectedEstimation.completion_urgency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget Range</span>
                          <span>{formatLabel(selectedEstimation.budget_range)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Notes */}
                {selectedEstimation.additional_notes && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedEstimation.additional_notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Section */}
                <Card className="border-primary/20">
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-semibold">Admin Actions</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editData.status}
                          onValueChange={(v) => setEditData({ ...editData, status: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Estimated Amount (₹)</Label>
                        <Input
                          type="number"
                          value={editData.estimated_amount}
                          onChange={(e) =>
                            setEditData({ ...editData, estimated_amount: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Notes</Label>
                      <Textarea
                        value={editData.admin_notes}
                        onChange={(e) =>
                          setEditData({ ...editData, admin_notes: e.target.value })
                        }
                        rows={3}
                        placeholder="Internal notes..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedEstimation(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate}>Update</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drawing" className="mt-4">
                {selectedEstimation.drawing_data ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <img
                        src={selectedEstimation.drawing_data}
                        alt="Project drawing"
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = 'drawing.png';
                        link.href = selectedEstimation.drawing_data!;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Drawing
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No drawing submitted</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="media" className="mt-4 space-y-6">
                {/* Voice Recording */}
                <div>
                  <h4 className="font-semibold mb-3">Voice Recording</h4>
                  {selectedEstimation.voice_recording_url ? (
                    <div className="space-y-3">
                      <AudioPlayer src={selectedEstimation.voice_recording_url} />
                      {selectedEstimation.voice_transcription && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Transcription:</p>
                          <p className="text-sm">{selectedEstimation.voice_transcription}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No voice recording</p>
                  )}
                </div>

                {/* Reference Images */}
                <div>
                  <h4 className="font-semibold mb-3">Reference Images</h4>
                  {selectedEstimation.reference_images && selectedEstimation.reference_images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedEstimation.reference_images.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxImage(url)}
                          className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={url}
                            alt={`Reference ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No reference images</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {lightboxImage && (
            <img
              src={lightboxImage}
              alt="Reference"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
