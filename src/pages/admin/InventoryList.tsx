import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, DollarSign, Package, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useInventory, useDeleteInventory } from '@/hooks/useInventory';
import { useAutoGenerateEventSections, useAutoGenerateInventory } from '@/hooks/useEventSections';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const InventoryList = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [autoGenConfig, setAutoGenConfig] = useState({
    eventId: '',
    minTickets: 1,
    maxTickets: 500,
    minPrice: 25,
    maxPrice: 200,
  });

  const { data: inventory = [], isLoading } = useInventory({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteInventory = useDeleteInventory();
  const autoGenerateSections = useAutoGenerateEventSections();
  const autoGenerateInventory = useAutoGenerateInventory();

  // Fetch events for filter with venue info
  const { data: events = [] } = useQuery({
    queryKey: ['events-for-filter-with-venue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, venue_id, event_date')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = 
      item.event_section?.section?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.event_section?.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.row_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesEvent = eventFilter === 'all' || item.event_section?.event?.id === eventFilter;
    
    return matchesSearch && matchesEvent;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInventory.mutateAsync(deleteId);
      toast.success('Inventory item deleted');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleAutoGenerate = async () => {
    if (!autoGenConfig.eventId) {
      toast.error('Please select an event');
      return;
    }
    
    const selectedEvent = events.find((e: any) => e.id === autoGenConfig.eventId);
    if (!selectedEvent?.venue_id) {
      toast.error('Selected event has no venue');
      return;
    }

    try {
      // First, generate event sections from venue sections
      try {
        await autoGenerateSections.mutateAsync({
          eventId: autoGenConfig.eventId,
          venueId: selectedEvent.venue_id,
          basePrice: autoGenConfig.minPrice, // Use minPrice as base
        });
        toast.success('Event sections created');
      } catch (err: any) {
        // Sections might already exist, continue
        if (!err.message?.includes('already exist')) {
          console.warn('Section generation:', err.message);
        }
      }

      // Then generate inventory with price range
      await autoGenerateInventory.mutateAsync({
        eventId: autoGenConfig.eventId,
        minTickets: autoGenConfig.minTickets,
        maxTickets: autoGenConfig.maxTickets,
        minPrice: autoGenConfig.minPrice,
        maxPrice: autoGenConfig.maxPrice,
      });

      toast.success(`Inventory generated with ${autoGenConfig.minTickets}-${autoGenConfig.maxTickets} tickets at $${autoGenConfig.minPrice}-$${autoGenConfig.maxPrice}`);
      setShowAutoGenerate(false);
      setAutoGenConfig({ eventId: '', minTickets: 1, maxTickets: 500, minPrice: 25, maxPrice: 200 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate inventory');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-success text-success-foreground">Available</Badge>;
      case 'reserved':
        return <Badge variant="secondary">Reserved</Badge>;
      case 'sold':
        return <Badge variant="outline">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isGenerating = autoGenerateSections.isPending || autoGenerateInventory.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Inventory</h1>
          <p className="text-muted-foreground">Manage ticket listings across all events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAutoGenerate(true)}>
            <Wand2 size={16} className="mr-2" />
            Auto-Generate
          </Button>
          <Button asChild>
            <Link to="/admin/inventory/new">
              <Plus size={16} className="mr-2" />
              Add Inventory
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by section, event, or row..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event: any) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <Package size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {inventory.filter((i: any) => i.status === 'available').length}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <Package size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {inventory.filter((i: any) => i.status === 'reserved').length}
              </p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${inventory.reduce((sum: number, i: any) => sum + (Number(i.price) || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Row</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {search || statusFilter !== 'all' || eventFilter !== 'all'
                    ? 'No inventory items found matching your filters'
                    : 'No inventory yet. Add tickets to get started!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {item.event_section?.event?.title || '—'}
                  </TableCell>
                  <TableCell>{item.event_section?.section?.name || '—'}</TableCell>
                  <TableCell>{item.row_name || '—'}</TableCell>
                  <TableCell>{item.seat_numbers || '—'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="font-medium">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/inventory/${item.id}`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-Generate Dialog */}
      <Dialog open={showAutoGenerate} onOpenChange={setShowAutoGenerate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auto-Generate Inventory</DialogTitle>
            <DialogDescription>
              Automatically create event sections and distribute tickets randomly across all sections.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Event *</Label>
              <Select
                value={autoGenConfig.eventId}
                onValueChange={(value) => setAutoGenConfig(prev => ({ ...prev, eventId: value }))}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minTickets">Min Tickets</Label>
                <Input
                  id="minTickets"
                  type="number"
                  min="1"
                  value={autoGenConfig.minTickets}
                  onChange={(e) => setAutoGenConfig(prev => ({ ...prev, minTickets: Number(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="maxTickets">Max Tickets</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  min="1"
                  value={autoGenConfig.maxTickets}
                  onChange={(e) => setAutoGenConfig(prev => ({ ...prev, maxTickets: Number(e.target.value) || 500 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Min Price ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  value={autoGenConfig.minPrice}
                  onChange={(e) => setAutoGenConfig(prev => ({ ...prev, minPrice: Number(e.target.value) || 25 }))}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  value={autoGenConfig.maxPrice}
                  onChange={(e) => setAutoGenConfig(prev => ({ ...prev, maxPrice: Number(e.target.value) || 200 }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Prices adjusted by section type (VIP +50%, Floor +30%, Upper -30%)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoGenerate(false)}>
              Cancel
            </Button>
            <Button onClick={handleAutoGenerate} disabled={isGenerating || !autoGenConfig.eventId}>
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryList;
