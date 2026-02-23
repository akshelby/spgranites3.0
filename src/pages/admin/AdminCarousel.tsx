import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image, Settings, RotateCw } from 'lucide-react';

interface CarouselCard {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface CarouselSettings {
  id: string;
  auto_rotate: boolean;
  rotation_speed: number;
  initial_visible_count: number;
  scroll_sensitivity: number;
}

export default function AdminCarousel() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [settings, setSettings] = useState<CarouselSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CarouselCard | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  const [collectionSpeed, setCollectionSpeed] = useState(() => {
    const saved = localStorage.getItem('spg_collection_speed');
    return saved ? parseFloat(saved) : 0.1;
  });

  const speedLabels: Record<string, string> = {
    '0.05': 'Very Slow',
    '0.1': 'Slow',
    '0.2': 'Normal',
    '0.4': 'Fast',
    '0.6': 'Very Fast',
    '1': 'Ultra Fast',
  };

  const getSpeedLabel = (val: number) => {
    const closest = Object.keys(speedLabels).reduce((prev, curr) =>
      Math.abs(parseFloat(curr) - val) < Math.abs(parseFloat(prev) - val) ? curr : prev
    );
    return speedLabels[closest] || `${val.toFixed(1)}x`;
  };

  const handleSpeedChange = (value: number[]) => {
    const speed = value[0];
    setCollectionSpeed(speed);
    localStorage.setItem('spg_collection_speed', speed.toString());
    window.dispatchEvent(new CustomEvent('spg_collection_speed_change', { detail: speed }));
  };

  const [settingsData, setSettingsData] = useState({
    auto_rotate: true,
    rotation_speed: 3000,
    initial_visible_count: 5,
    scroll_sensitivity: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cardsData = await api.get('/api/admin/carousel/cards');
      setCards(cardsData || []);

      try {
        const settingsRes = await api.get('/api/admin/carousel/settings');
        if (settingsRes) {
          setSettings(settingsRes);
          setSettingsData({
            auto_rotate: settingsRes.auto_rotate,
            rotation_speed: settingsRes.rotation_speed,
            initial_visible_count: settingsRes.initial_visible_count,
            scroll_sensitivity: settingsRes.scroll_sensitivity,
          });
        }
      } catch (e) {
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cardData = {
        title: formData.title,
        image_url: formData.image_url,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingCard) {
        await api.put(`/api/admin/carousel/cards/${editingCard.id}`, cardData);
        toast({ title: 'Card updated' });
      } else {
        await api.post('/api/admin/carousel/cards', cardData);
        toast({ title: 'Card created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/api/admin/carousel/settings', settingsData);
      toast({ title: 'Settings saved' });
      setSettingsOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (card: CarouselCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      image_url: card.image_url,
      display_order: card.display_order,
      is_active: card.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await api.delete(`/api/admin/carousel/cards/${id}`);
      toast({ title: 'Card deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingCard(null);
    setFormData({ title: '', image_url: '', display_order: 0, is_active: true });
  };

  const columns = [
    {
      key: 'title',
      header: 'Card',
      render: (card: CarouselCard) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; }}
              />
            ) : null}
            {!card.image_url && <Image className="h-5 w-5 text-muted-foreground" />}
          </div>
          <p className="font-medium">{card.title}</p>
        </div>
      ),
    },
    {
      key: 'display_order',
      header: 'Order',
      render: (card: CarouselCard) => <Badge variant="secondary">{card.display_order}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (card: CarouselCard) => (
        <Badge variant={card.is_active ? 'default' : 'secondary'}>
          {card.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (card: CarouselCard) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(card)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Hero Carousel"
        description="Manage homepage carousel cards"
        action={
          <div className="flex gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carousel Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_rotate">Auto Rotate</Label>
                    <Switch
                      id="auto_rotate"
                      checked={settingsData.auto_rotate}
                      onCheckedChange={(checked) => setSettingsData({ ...settingsData, auto_rotate: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rotation_speed">Rotation Speed (ms)</Label>
                    <Input
                      id="rotation_speed"
                      type="number"
                      value={settingsData.rotation_speed}
                      onChange={(e) => setSettingsData({ ...settingsData, rotation_speed: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial_visible_count">Initial Visible Cards</Label>
                    <Input
                      id="initial_visible_count"
                      type="number"
                      value={settingsData.initial_visible_count}
                      onChange={(e) => setSettingsData({ ...settingsData, initial_visible_count: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scroll_sensitivity">Scroll Sensitivity</Label>
                    <Input
                      id="scroll_sensitivity"
                      type="number"
                      value={settingsData.scroll_sensitivity}
                      onChange={(e) => setSettingsData({ ...settingsData, scroll_sensitivity: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSettings}>
                      Save Settings
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCard ? 'Edit Card' : 'Add Card'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCard ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={cards}
        loading={loading}
        emptyMessage="No carousel cards yet"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RotateCw className="h-5 w-5" />
            Premium Collection Rotation Speed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Controls how fast the product cards rotate on the homepage
            </Label>
            <Badge variant="outline" className="text-sm font-semibold">
              {getSpeedLabel(collectionSpeed)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Slow</span>
            <Slider
              value={[collectionSpeed]}
              onValueChange={handleSpeedChange}
              min={0.05}
              max={1}
              step={0.05}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">Fast</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Current speed: {collectionSpeed.toFixed(2)}x — Changes apply instantly on the homepage.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
