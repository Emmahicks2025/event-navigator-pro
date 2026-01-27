import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, Star, StarOff } from 'lucide-react';
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

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  is_featured: boolean;
  is_active: boolean;
  price_from: number | null;
  price_to: number | null;
  venues: { name: string } | null;
  categories: { name: string } | null;
}

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          event_time,
          is_featured,
          is_active,
          price_from,
          price_to,
          venues (name),
          categories (name)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_featured: !currentValue })
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.map(e => e.id === id ? { ...e, is_featured: !currentValue } : e));
      toast.success(currentValue ? 'Removed from featured' : 'Added to featured');
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentValue })
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.map(e => e.id === id ? { ...e, is_active: !currentValue } : e));
      toast.success(currentValue ? 'Event deactivated' : 'Event activated');
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== deleteId));
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error('Failed to delete event');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events</h2>
          <p className="text-muted-foreground">Manage your events and ticket listings</p>
        </div>
        <Button onClick={() => navigate('/admin/events/new')}>
          <Plus size={18} className="mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.categories?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{event.venues?.name || 'No venue'}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(event.event_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{event.event_time || 'TBD'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.price_from ? `$${event.price_from} - $${event.price_to}` : 'Not set'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={event.is_active ? 'default' : 'secondary'}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {event.is_featured && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(event.id, event.is_featured)}
                          title={event.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {event.is_featured ? (
                            <StarOff size={16} className="text-amber-500" />
                          ) : (
                            <Star size={16} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(event.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
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
    </div>
  );
};

export default EventsList;
