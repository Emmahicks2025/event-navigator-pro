import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Star, ArrowUp, ArrowDown, Music, Trophy, Sparkles } from 'lucide-react';

interface FeaturedEvent {
  id: string;
  title: string;
  event_date: string;
  is_featured: boolean;
  display_order: number;
  homepage_sections: string[] | null;
  venues: { name: string } | null;
  categories: { slug: string; name: string } | null;
}

const HOMEPAGE_SECTIONS = [
  { id: 'top_events', label: 'Top Events', icon: Star, description: 'Featured carousel at the top' },
  { id: 'concerts', label: 'Upcoming Concerts', icon: Music, description: 'Concerts section' },
  { id: 'sports', label: 'Sports Events', icon: Trophy, description: 'Sports section' },
];

const FeaturedManager = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('top_events');

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
          homepage_sections,
          venues (name),
          categories:category_id (slug, name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setEvents((data as FeaturedEvent[]) || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = async (eventId: string, sectionId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const currentSections = event.homepage_sections || [];
    const newSections = currentSections.includes(sectionId)
      ? currentSections.filter(s => s !== sectionId)
      : [...currentSections, sectionId];

    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          homepage_sections: newSections,
          is_featured: newSections.includes('top_events')
        })
        .eq('id', eventId);

      if (error) throw error;
      
      setEvents(events.map(e => 
        e.id === eventId 
          ? { ...e, homepage_sections: newSections, is_featured: newSections.includes('top_events') } 
          : e
      ));
      
      toast.success(
        newSections.includes(sectionId) 
          ? `Added to ${HOMEPAGE_SECTIONS.find(s => s.id === sectionId)?.label}` 
          : `Removed from ${HOMEPAGE_SECTIONS.find(s => s.id === sectionId)?.label}`
      );
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  const moveEvent = async (id: string, direction: 'up' | 'down', sectionId: string) => {
    const sectionEvents = events.filter(e => e.homepage_sections?.includes(sectionId));
    const index = sectionEvents.findIndex(e => e.id === id);
    
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sectionEvents.length - 1)) {
      return;
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentEvent = sectionEvents[index];
    const swapEvent = sectionEvents[swapIndex];

    const newEvents = events.map(e => {
      if (e.id === currentEvent.id) return { ...e, display_order: swapEvent.display_order };
      if (e.id === swapEvent.id) return { ...e, display_order: currentEvent.display_order };
      return e;
    });
    
    setEvents(newEvents);

    try {
      await Promise.all([
        supabase.from('events').update({ display_order: swapEvent.display_order }).eq('id', currentEvent.id),
        supabase.from('events').update({ display_order: currentEvent.display_order }).eq('id', swapEvent.id),
      ]);
    } catch (err) {
      toast.error('Failed to reorder events');
      fetchEvents();
    }
  };

  const getEventsForSection = (sectionId: string) => {
    return events
      .filter(e => e.homepage_sections?.includes(sectionId))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

  const getAvailableEvents = (sectionId: string) => {
    return events.filter(e => !e.homepage_sections?.includes(sectionId));
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Homepage Sections Manager</h2>
        <p className="text-muted-foreground">Control which events appear in each homepage section</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {HOMEPAGE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const count = getEventsForSection(section.id).length;
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {section.label}
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {HOMEPAGE_SECTIONS.map((section) => {
          const sectionEvents = getEventsForSection(section.id);
          const availableEvents = getAvailableEvents(section.id);
          const Icon = section.icon;

          return (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              {/* Current Section Events */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{section.label} ({sectionEvents.length})</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Order</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Remove</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectionEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No events in this section. Add events below.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sectionEvents.map((event, index) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveEvent(event.id, 'up', section.id)}
                                  disabled={index === 0}
                                >
                                  <ArrowUp size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveEvent(event.id, 'down', section.id)}
                                  disabled={index === sectionEvents.length - 1}
                                >
                                  <ArrowDown size={14} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.venues?.name || 'TBD'}</TableCell>
                            <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                            <TableCell>{event.categories?.name || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={true}
                                onCheckedChange={() => toggleSection(event.id, section.id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Available Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Events to {section.label}</CardTitle>
                  <CardDescription>
                    Toggle to add events to this section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>In Sections</TableHead>
                        <TableHead className="text-right">Add</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            All events are in this section
                          </TableCell>
                        </TableRow>
                      ) : (
                        availableEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.venues?.name || 'TBD'}</TableCell>
                            <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                            <TableCell>{event.categories?.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {(event.homepage_sections || []).map(s => {
                                  const sec = HOMEPAGE_SECTIONS.find(hs => hs.id === s);
                                  return sec ? (
                                    <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      {sec.label}
                                    </span>
                                  ) : null;
                                })}
                                {(!event.homepage_sections || event.homepage_sections.length === 0) && (
                                  <span className="text-xs text-muted-foreground">None</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={false}
                                onCheckedChange={() => toggleSection(event.id, section.id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default FeaturedManager;