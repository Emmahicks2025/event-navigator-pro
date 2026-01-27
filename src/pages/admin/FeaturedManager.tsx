import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Star, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface FeaturedEvent {
  id: string;
  title: string;
  event_date: string;
  is_featured: boolean;
  display_order: number;
  venues: { name: string } | null;
}

const FeaturedManager = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
          is_featured,
          display_order,
          venues (name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

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

  const moveEvent = async (id: string, direction: 'up' | 'down') => {
    const index = events.findIndex(e => e.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === events.length - 1)) {
      return;
    }

    const newEvents = [...events];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display orders
    const tempOrder = newEvents[index].display_order;
    newEvents[index].display_order = newEvents[swapIndex].display_order;
    newEvents[swapIndex].display_order = tempOrder;

    // Swap positions in array
    [newEvents[index], newEvents[swapIndex]] = [newEvents[swapIndex], newEvents[index]];
    
    setEvents(newEvents);

    try {
      await Promise.all([
        supabase.from('events').update({ display_order: newEvents[index].display_order }).eq('id', newEvents[index].id),
        supabase.from('events').update({ display_order: newEvents[swapIndex].display_order }).eq('id', newEvents[swapIndex].id),
      ]);
    } catch (err) {
      toast.error('Failed to reorder events');
      fetchEvents(); // Refetch on error
    }
  };

  const featuredEvents = events.filter(e => e.is_featured);
  const regularEvents = events.filter(e => !e.is_featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Featured Events</h2>
        <p className="text-muted-foreground">Manage which events appear on the homepage carousel</p>
      </div>

      {/* Featured Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <CardTitle>Featured ({featuredEvents.length})</CardTitle>
          </div>
          <CardDescription>
            These events will be shown prominently on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Featured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featuredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No featured events. Toggle events below to feature them.
                  </TableCell>
                </TableRow>
              ) : (
                featuredEvents.map((event, index) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveEvent(event.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveEvent(event.id, 'down')}
                          disabled={index === featuredEvents.length - 1}
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.venues?.name || 'TBD'}</TableCell>
                    <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={event.is_featured}
                        onCheckedChange={() => toggleFeatured(event.id, event.is_featured)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Active Events</CardTitle>
          <CardDescription>
            Toggle the switch to feature or unfeature an event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Featured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regularEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    All events are featured
                  </TableCell>
                </TableRow>
              ) : (
                regularEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.venues?.name || 'TBD'}</TableCell>
                    <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={event.is_featured}
                        onCheckedChange={() => toggleFeatured(event.id, event.is_featured)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedManager;
