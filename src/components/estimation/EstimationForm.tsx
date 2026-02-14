import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection } from './FormSection';
import { DrawingCanvas } from './DrawingCanvas';
import { VoiceRecorder } from './VoiceRecorder';
import { ImageUploader } from './ImageUploader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

const PROJECT_TYPES = [
  'Kitchen Countertop',
  'Flooring Tiles',
  'Wall Cladding',
  'Vanity Top',
  'Staircase',
  'Other',
];

const KITCHEN_TYPES = [
  { value: 'straight', label: 'Straight' },
  { value: 'l_shape', label: 'L-Shape' },
  { value: 'u_shape', label: 'U-Shape' },
  { value: 'island', label: 'Island' },
];

const PROJECT_NATURES = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
];

const STONE_TYPES = [
  { value: 'granite', label: 'Granite' },
  { value: 'marble', label: 'Marble' },
  { value: 'quartz', label: 'Quartz' },
  { value: 'porcelain', label: 'Porcelain' },
  { value: 'not_sure', label: 'Not Sure' },
];

const FINISH_TYPES = [
  { value: 'polished', label: 'Polished' },
  { value: 'honed', label: 'Honed' },
  { value: 'leather', label: 'Leather' },
];

const THICKNESS_OPTIONS = [
  { value: '18mm', label: '18mm' },
  { value: '20mm', label: '20mm' },
  { value: '30mm', label: '30mm' },
];

const URGENCY_LEVELS = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'within_1_month', label: 'Within 1 Month' },
  { value: 'within_2_weeks', label: 'Within 2 Weeks' },
  { value: 'urgent', label: 'Urgent' },
];

const BUDGET_RANGES = [
  { value: 'under_50k', label: 'Under ₹50,000' },
  { value: '50k_to_1l', label: '₹50,000 - ₹1,00,000' },
  { value: '1l_to_2l', label: '₹1,00,000 - ₹2,00,000' },
  { value: '2l_to_5l', label: '₹2,00,000 - ₹5,00,000' },
  { value: 'above_5l', label: 'Above ₹5,00,000' },
  { value: 'not_decided', label: 'Not Decided' },
];

const CUTOUT_OPTIONS = [
  'Sink Cutout',
  'Cooktop Cutout',
  'Faucet Hole',
  'Soap Dispenser Hole',
  'None Required',
];

const EDGE_PROFILES = [
  'Straight Edge',
  'Beveled Edge',
  'Bullnose',
  'Ogee',
  'Waterfall',
  'Other',
];

const formSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  mobile_number: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  project_location: z.string().min(3, 'Project location is required'),
  project_types: z.array(z.string()).min(1, 'Select at least one project type'),
  project_type_other: z.string().optional(),
  kitchen_type: z.string().optional(),
  project_nature: z.string().optional(),
  number_of_counters: z.number().optional(),
  stone_type: z.string().optional(),
  preferred_color: z.string().optional(),
  finish_type: z.string().optional(),
  approximate_length: z.string().optional(),
  approximate_width: z.string().optional(),
  thickness: z.string().optional(),
  quantity: z.string().optional(),
  flooring_required: z.boolean().default(false),
  tile_size_preference: z.string().optional(),
  total_flooring_area: z.string().optional(),
  expected_start_date: z.date().optional(),
  completion_urgency: z.string().optional(),
  budget_range: z.string().optional(),
  cutouts_required: z.array(z.string()).optional(),
  edge_profile_preference: z.string().optional(),
  additional_notes: z.string().optional(),
  drawing_data: z.string().optional(),
  voice_recording_url: z.string().optional(),
  reference_images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

const SECTIONS = [
  { id: 'customer', title: 'Customer Details', description: 'Your contact information' },
  { id: 'project', title: 'Project Type', description: 'What kind of work do you need?' },
  { id: 'kitchen', title: 'Kitchen/Area Info', description: 'Layout and project details' },
  { id: 'stone', title: 'Stone Preferences', description: 'Material and finish selection' },
  { id: 'size', title: 'Size & Quantity', description: 'Dimensions and quantity' },
  { id: 'flooring', title: 'Flooring/Tiles', description: 'Flooring specifications' },
  { id: 'timeline', title: 'Timeline & Budget', description: 'Schedule and budget' },
  { id: 'drawing', title: 'Drawing Canvas', description: 'Sketch your layout' },
  { id: 'voice', title: 'Voice Notes', description: 'Record your requirements' },
  { id: 'additional', title: 'Additional Info', description: 'Cutouts, edges & images' },
];

export function EstimationForm() {
  const [searchParams] = useSearchParams();
  const [openSection, setOpenSection] = useState<string>('customer');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const surfaceParam = searchParams.get('surface');
  const stoneParam = searchParams.get('stone');
  const stoneCategoryParam = searchParams.get('stoneCategory');
  const edgeParam = searchParams.get('edge');
  const finishParam = searchParams.get('finish');

  const getProjectTypeFromSurface = (s: string | null) => {
    if (s === 'kitchen') return ['Kitchen Countertop'];
    if (s === 'vanity') return ['Vanity Top'];
    return [];
  };

  const getEdgeProfileValue = (e: string | null) => {
    if (!e) return '';
    const map: Record<string, string> = {
      'Straight': 'Straight Edge',
      'Full Bullnose': 'Bullnose',
      'Half Bullnose': 'Bullnose',
      'Bevel': 'Beveled Edge',
      'Ogee': 'Ogee',
      'Dupont': 'Other',
    };
    return map[e] || '';
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      mobile_number: '',
      email: '',
      project_location: '',
      project_types: getProjectTypeFromSurface(surfaceParam),
      project_type_other: surfaceParam === 'dining' ? 'Dining Table Top' : '',
      kitchen_type: '',
      project_nature: '',
      stone_type: stoneCategoryParam || '',
      preferred_color: stoneParam || '',
      finish_type: finishParam?.toLowerCase() === 'leathered' ? 'leather' : (finishParam?.toLowerCase() || ''),
      approximate_length: '',
      approximate_width: '',
      thickness: '',
      quantity: '',
      flooring_required: false,
      tile_size_preference: '',
      total_flooring_area: '',
      completion_urgency: '',
      budget_range: '',
      cutouts_required: [],
      edge_profile_preference: getEdgeProfileValue(edgeParam),
      additional_notes: surfaceParam ? `From Stone Visualizer: ${stoneParam || ''} ${stoneCategoryParam || ''}, ${finishParam || ''} finish, ${edgeParam || ''} edge` : '',
      drawing_data: '',
      voice_recording_url: '',
      reference_images: [],
    },
  });

  const values = form.watch();

  // Calculate progress
  useEffect(() => {
    const completed = new Set<string>();

    // Customer section
    if (values.full_name && values.mobile_number && values.project_location) {
      completed.add('customer');
    }

    // Project type section
    if (values.project_types.length > 0) {
      completed.add('project');
    }

    // Kitchen section
    if (values.kitchen_type || values.project_nature) {
      completed.add('kitchen');
    }

    // Stone section
    if (values.stone_type) {
      completed.add('stone');
    }

    // Size section
    if (values.approximate_length || values.approximate_width || values.quantity) {
      completed.add('size');
    }

    // Flooring section
    if (values.flooring_required || values.tile_size_preference || values.total_flooring_area) {
      completed.add('flooring');
    }

    // Timeline section
    if (values.expected_start_date || values.completion_urgency || values.budget_range) {
      completed.add('timeline');
    }

    // Drawing section
    if (values.drawing_data) {
      completed.add('drawing');
    }

    // Voice section
    if (values.voice_recording_url) {
      completed.add('voice');
    }

    // Additional section
    if (
      (values.cutouts_required && values.cutouts_required.length > 0) ||
      values.edge_profile_preference ||
      values.additional_notes ||
      (values.reference_images && values.reference_images.length > 0)
    ) {
      completed.add('additional');
    }

    setCompletedSections(completed);
  }, [values]);

  const progressPercentage = Math.round((completedSections.size / SECTIONS.length) * 100);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error: submitError } = await supabase.from('estimation_enquiries').insert({
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        email: data.email || null,
        project_location: data.project_location,
        project_types: data.project_types,
        project_type_other: data.project_type_other || null,
        kitchen_type: data.kitchen_type || null,
        project_nature: data.project_nature || null,
        number_of_counters: data.number_of_counters || null,
        stone_type: data.stone_type || null,
        preferred_color: data.preferred_color || null,
        finish_type: data.finish_type || null,
        approximate_length: data.approximate_length || null,
        approximate_width: data.approximate_width || null,
        thickness: data.thickness || null,
        quantity: data.quantity || null,
        flooring_required: data.flooring_required,
        tile_size_preference: data.tile_size_preference || null,
        total_flooring_area: data.total_flooring_area || null,
        expected_start_date: data.expected_start_date?.toISOString() || null,
        completion_urgency: data.completion_urgency || null,
        budget_range: data.budget_range || null,
        cutouts_required: data.cutouts_required || null,
        edge_profile_preference: data.edge_profile_preference || null,
        additional_notes: data.additional_notes || null,
        drawing_data: data.drawing_data || null,
        voice_recording_url: data.voice_recording_url || null,
        reference_images: data.reference_images || null,
        status: 'pending',
      }).select().single();
      if (submitError) throw submitError;

      setIsSubmitted(true);
      toast.success('Estimation request submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Your estimation request has been submitted successfully. Our team will review your
          requirements and contact you within 24-48 hours with a detailed quote.
        </p>
        <Button onClick={() => window.location.reload()}>Submit Another Request</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Form Progress</span>
          <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Section 1: Customer Details */}
          <FormSection
            stepNumber={1}
            totalSteps={10}
            title={SECTIONS[0].title}
            description={SECTIONS[0].description}
            isOpen={openSection === 'customer'}
            isCompleted={completedSections.has('customer')}
            onToggle={() => setOpenSection(openSection === 'customer' ? '' : 'customer')}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Area, Locality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section 2: Project Type */}
          <FormSection
            stepNumber={2}
            totalSteps={10}
            title={SECTIONS[1].title}
            description={SECTIONS[1].description}
            isOpen={openSection === 'project'}
            isCompleted={completedSections.has('project')}
            onToggle={() => setOpenSection(openSection === 'project' ? '' : 'project')}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="project_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Project Type *</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {PROJECT_TYPES.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="project_types"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    if (checked) {
                                      field.onChange([...value, type]);
                                    } else {
                                      field.onChange(value.filter((v) => v !== type));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {type}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {values.project_types.includes('Other') && (
                <FormField
                  control={form.control}
                  name="project_type_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe your project type" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </FormSection>

          {/* Section 3: Kitchen/Area Info */}
          <FormSection
            stepNumber={3}
            totalSteps={10}
            title={SECTIONS[2].title}
            description={SECTIONS[2].description}
            isOpen={openSection === 'kitchen'}
            isCompleted={completedSections.has('kitchen')}
            onToggle={() => setOpenSection(openSection === 'kitchen' ? '' : 'kitchen')}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kitchen_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitchen Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KITCHEN_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project_nature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Nature</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nature" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_NATURES.map((nature) => (
                          <SelectItem key={nature.value} value={nature.value}>
                            {nature.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number_of_counters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Counters</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section 4: Stone Preferences */}
          <FormSection
            stepNumber={4}
            totalSteps={10}
            title={SECTIONS[3].title}
            description={SECTIONS[3].description}
            isOpen={openSection === 'stone'}
            isCompleted={completedSections.has('stone')}
            onToggle={() => setOpenSection(openSection === 'stone' ? '' : 'stone')}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stone_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stone Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stone type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STONE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferred_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Black, White, Grey" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finish_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finish Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select finish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FINISH_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section 5: Size & Quantity */}
          <FormSection
            stepNumber={5}
            totalSteps={10}
            title={SECTIONS[4].title}
            description={SECTIONS[4].description}
            isOpen={openSection === 'size'}
            isCompleted={completedSections.has('size')}
            onToggle={() => setOpenSection(openSection === 'size' ? '' : 'size')}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="approximate_length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approximate Length</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 feet" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approximate_width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approximate Width</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 feet" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thickness</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select thickness" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {THICKNESS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 50 sq ft" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section 6: Flooring/Tiles */}
          <FormSection
            stepNumber={6}
            totalSteps={10}
            title={SECTIONS[5].title}
            description={SECTIONS[5].description}
            isOpen={openSection === 'flooring'}
            isCompleted={completedSections.has('flooring')}
            onToggle={() => setOpenSection(openSection === 'flooring' ? '' : 'flooring')}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="flooring_required"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Flooring Required?</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Do you need flooring tiles for this project?
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {values.flooring_required && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tile_size_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tile Size Preference</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2x2 feet" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_flooring_area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Flooring Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 500 sq ft" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Section 7: Timeline & Budget */}
          <FormSection
            stepNumber={7}
            totalSteps={10}
            title={SECTIONS[6].title}
            description={SECTIONS[6].description}
            isOpen={openSection === 'timeline'}
            isCompleted={completedSections.has('timeline')}
            onToggle={() => setOpenSection(openSection === 'timeline' ? '' : 'timeline')}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="completion_urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Urgency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {URGENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUDGET_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Section 8: Drawing Canvas */}
          <FormSection
            stepNumber={8}
            totalSteps={10}
            title={SECTIONS[7].title}
            description={SECTIONS[7].description}
            isOpen={openSection === 'drawing'}
            isCompleted={completedSections.has('drawing')}
            onToggle={() => setOpenSection(openSection === 'drawing' ? '' : 'drawing')}
          >
            <FormField
              control={form.control}
              name="drawing_data"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DrawingCanvas
                      onSave={field.onChange}
                      initialData={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Section 9: Voice Notes */}
          <FormSection
            stepNumber={9}
            totalSteps={10}
            title={SECTIONS[8].title}
            description={SECTIONS[8].description}
            isOpen={openSection === 'voice'}
            isCompleted={completedSections.has('voice')}
            onToggle={() => setOpenSection(openSection === 'voice' ? '' : 'voice')}
          >
            <FormField
              control={form.control}
              name="voice_recording_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <VoiceRecorder
                      onRecordingComplete={field.onChange}
                      existingUrl={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Section 10: Additional Info */}
          <FormSection
            stepNumber={10}
            totalSteps={10}
            title={SECTIONS[9].title}
            description={SECTIONS[9].description}
            isOpen={openSection === 'additional'}
            isCompleted={completedSections.has('additional')}
            onToggle={() => setOpenSection(openSection === 'additional' ? '' : 'additional')}
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="cutouts_required"
                render={() => (
                  <FormItem>
                    <FormLabel>Cutouts Required</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {CUTOUT_OPTIONS.map((cutout) => (
                        <FormField
                          key={cutout}
                          control={form.control}
                          name="cutouts_required"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(cutout)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    if (checked) {
                                      field.onChange([...value, cutout]);
                                    } else {
                                      field.onChange(value.filter((v) => v !== cutout));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {cutout}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="edge_profile_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edge Profile Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select edge profile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDGE_PROFILES.map((profile) => (
                          <SelectItem key={profile} value={profile}>
                            {profile}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific requirements, preferences, or questions..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Images</FormLabel>
                    <FormControl>
                      <ImageUploader
                        onImagesChange={field.onChange}
                        existingImages={field.value}
                        maxImages={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Submit Estimation Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
