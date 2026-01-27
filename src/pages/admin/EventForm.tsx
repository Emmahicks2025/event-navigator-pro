import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
}

interface Performer {
  id: string;
  name: string;
}

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue_id: '',
    category_id: '',
    performer_id: '',
    event_date: '',
    event_time: '',
    doors_open_time: '',
    image_url: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
    price_from: '',
    price_to: '',
  });

  useEffect(() => {
    fetchOptions();
    if (isEditing) {
      fetchEvent();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [categoriesRes, venuesRes, performersRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('sort_order'),
        supabase.from('venues').select('id, name, city').order('name'),
        supabase.from('performers').select('id, name').order('name'),
      ]);

      setCategories(categoriesRes.data || []);
      setVenues(venuesRes.data || []);
      setPerformers(performersRes.data || []);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        venue_id: data.venue_id || '',
        category_id: data.category_id || '',
        performer_id: data.performer_id || '',
        event_date: data.event_date || '',
        event_time: data.event_time || '',
        doors_open_time: data.doors_open_time || '',
        image_url: data.image_url || '',
        is_featured: data.is_featured || false,
        is_active: data.is_active ?? true,
        display_order: data.display_order || 0,
        price_from: data.price_from?.toString() || '',
        price_to: data.price_to?.toString() || '',
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.event_date) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        venue_id: formData.venue_id || null,
        category_id: formData.category_id || null,
        performer_id: formData.performer_id || null,
        event_date: formData.event_date,
        event_time: formData.event_time || null,
        doors_open_time: formData.doors_open_time || null,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        display_order: formData.display_order,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        price_to: formData.price_to ? parseFloat(formData.price_to) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Event created successfully');
      }

      navigate('/admin/events');
    } catch (err: any) {
      console.error('Error saving event:', err);
      toast.error(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/events')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update event details' : 'Add a new event to your platform'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Taylor Swift - Eras Tour"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="performer">Performer</Label>
                <Select
                  value={formData.performer_id}
                  onValueChange={(value) => setFormData({ ...formData, performer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select performer" />
                  </SelectTrigger>
                  <SelectContent>
                    {performers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Date, Time & Venue */}
          <Card>
            <CardHeader>
              <CardTitle>Date, Time & Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Select
                  value={formData.venue_id}
                  onValueChange={(value) => setFormData({ ...formData, venue_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} - {v.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_time">Event Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doors_open">Doors Open</Label>
                  <Input
                    id="doors_open"
                    type="time"
                    value={formData.doors_open_time}
                    onChange={(e) => setFormData({ ...formData, doors_open_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_from">Price From ($)</Label>
                  <Input
                    id="price_from"
                    type="number"
                    step="0.01"
                    value={formData.price_from}
                    onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_to">Price To ($)</Label>
                  <Input
                    id="price_to"
                    type="number"
                    step="0.01"
                    value={formData.price_to}
                    onChange={(e) => setFormData({ ...formData, price_to: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_active">Active</Label>
                    <p className="text-sm text-muted-foreground">Event is visible to users</p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show on homepage carousel</p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditing ? 'Update Event' : 'Create Event'}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/events')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
