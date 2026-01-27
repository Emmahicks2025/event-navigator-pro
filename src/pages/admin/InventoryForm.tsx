import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateInventory, useUpdateInventory } from '@/hooks/useInventory';

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    event_section_id: '',
    price: '',
    quantity: '1',
    row_name: '',
    seat_numbers: '',
    status: 'available',
    is_resale: false,
    is_lowest_price: false,
    has_clear_view: false,
    notes: '',
  });

  const [selectedEventId, setSelectedEventId] = useState('');

  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['events-for-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date')
        .eq('is_active', true)
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch event sections for selected event
  const { data: eventSections = [] } = useQuery({
    queryKey: ['event-sections-for-inventory', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data, error } = await supabase
        .from('event_sections')
        .select(`
          *,
          section:sections(id, name)
        `)
        .eq('event_id', selectedEventId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventId,
  });

  // Fetch existing inventory if editing
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('ticket_inventory')
        .select(`
          *,
          event_section:event_sections(
            *,
            event:events(id, title),
            section:sections(id, name)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (inventory) {
      setSelectedEventId(inventory.event_section?.event?.id || '');
      setFormData({
        event_section_id: inventory.event_section_id,
        price: String(inventory.price),
        quantity: String(inventory.quantity),
        row_name: inventory.row_name || '',
        seat_numbers: inventory.seat_numbers || '',
        status: inventory.status || 'available',
        is_resale: inventory.is_resale || false,
        is_lowest_price: inventory.is_lowest_price || false,
        has_clear_view: inventory.has_clear_view || false,
        notes: inventory.notes || '',
      });
    }
  }, [inventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.event_section_id) {
      toast.error('Please select an event and section');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const payload = {
      event_section_id: formData.event_section_id,
      price: Number(formData.price),
      quantity: Number(formData.quantity) || 1,
      row_name: formData.row_name || null,
      seat_numbers: formData.seat_numbers || null,
      status: formData.status,
      is_resale: formData.is_resale,
      is_lowest_price: formData.is_lowest_price,
      has_clear_view: formData.has_clear_view,
      notes: formData.notes || null,
    };

    try {
      if (isEditing) {
        await updateInventory.mutateAsync({ id, ...payload });
        toast.success('Inventory updated successfully');
      } else {
        await createInventory.mutateAsync(payload);
        toast.success('Inventory created successfully');
      }
      navigate('/admin/inventory');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save inventory');
    }
  };

  const isSaving = createInventory.isPending || updateInventory.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Inventory' : 'Add Inventory'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update ticket listing' : 'Create a new ticket listing'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border border-border p-6">
        <div className="grid gap-4">
          {/* Event Selection */}
          <div>
            <Label>Event *</Label>
            <Select
              value={selectedEventId}
              onValueChange={(value) => {
                setSelectedEventId(value);
                setFormData(prev => ({ ...prev, event_section_id: '' }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event: any) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} ({new Date(event.event_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div>
            <Label>Section *</Label>
            <Select
              value={formData.event_section_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_section_id: value }))}
              disabled={!selectedEventId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedEventId ? 'Select a section' : 'Select an event first'} />
              </SelectTrigger>
              <SelectContent>
                {eventSections.map((es: any) => (
                  <SelectItem key={es.id} value={es.id}>
                    {es.section?.name} - ${Number(es.price).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="row_name">Row</Label>
              <Input
                id="row_name"
                value={formData.row_name}
                onChange={(e) => setFormData(prev => ({ ...prev, row_name: e.target.value }))}
                placeholder="A, B, 1, 2..."
              />
            </div>

            <div>
              <Label htmlFor="seat_numbers">Seat Numbers</Label>
              <Input
                id="seat_numbers"
                value={formData.seat_numbers}
                onChange={(e) => setFormData(prev => ({ ...prev, seat_numbers: e.target.value }))}
                placeholder="1-4, 12, 13..."
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Resale Ticket</Label>
                <p className="text-xs text-muted-foreground">This ticket is being resold</p>
              </div>
              <Switch
                checked={formData.is_resale}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_resale: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lowest Price</Label>
                <p className="text-xs text-muted-foreground">Mark as lowest price in section</p>
              </div>
              <Switch
                checked={formData.is_lowest_price}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_lowest_price: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Clear View</Label>
                <p className="text-xs text-muted-foreground">Seat has unobstructed view</p>
              </div>
              <Switch
                checked={formData.has_clear_view}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_clear_view: checked }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about these tickets..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/inventory')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            {isEditing ? 'Update' : 'Create'} Inventory
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
