import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle2, XCircle, MapPin, Loader2, Zap, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SyncResult {
  venue: string;
  venue_id?: string;
  status: string;
  svg_sections_found?: number;
  existing_sections?: number;
  updated?: number;
  created?: number;
  had_only_generic?: boolean;
  message?: string;
}

interface LinkResult {
  event: string;
  success: boolean;
  total_mappable_sections?: number;
  already_linked?: number;
  created_event_sections?: number;
  created_inventory_items?: number;
  error?: string;
}

const SectionSync = () => {
  const queryClient = useQueryClient();
  const [venueResults, setVenueResults] = useState<SyncResult[]>([]);
  const [eventResults, setEventResults] = useState<LinkResult[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  // Fetch venues with SVG maps
  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ['venues-with-maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, city, svg_map')
        .not('svg_map', 'is', null)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch events that need section linking
  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events-needing-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, event_date,
          venue:venues!inner(id, name, svg_map)
        `)
        .not('venue_id', 'is', null)
        .eq('is_active', true)
        .order('event_date', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data.filter(e => e.venue?.svg_map);
    },
  });

  // Fetch sections summary
  const { data: sectionStats = [] } = useQuery({
    queryKey: ['section-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('venue_id, svg_path');
      if (error) throw error;
      
      const stats = new Map<string, { total: number; linked: number }>();
      data.forEach(section => {
        const existing = stats.get(section.venue_id) || { total: 0, linked: 0 };
        existing.total++;
        if (section.svg_path) existing.linked++;
        stats.set(section.venue_id, existing);
      });
      
      return Array.from(stats.entries()).map(([venue_id, counts]) => ({
        venue_id,
        ...counts,
      }));
    },
  });

  // Sync venue sections mutation
  const syncVenueMutation = useMutation({
    mutationFn: async (venueId?: string) => {
      const response = await supabase.functions.invoke('sync-svg-sections', {
        body: venueId ? { venue_id: venueId, replace_sections: true } : { replace_sections: true },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      setVenueResults(data.results || []);
      queryClient.invalidateQueries({ queryKey: ['section-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      
      const successCount = data.results?.filter((r: SyncResult) => r.status === 'success').length || 0;
      const totalCreated = data.results?.reduce((sum: number, r: SyncResult) => sum + (r.created || 0), 0) || 0;
      
      toast.success(`Synced ${successCount} venues: ${totalCreated} sections created`);
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  // Link event sections mutation
  const linkEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await supabase.functions.invoke('link-event-sections', {
        body: { event_id: eventId, generate_inventory: true, tickets_per_section: 20 },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      setEventResults(prev => [...prev, { ...data, success: true }]);
      toast.success(`Linked ${data.created_event_sections} sections for ${data.event}`);
    },
    onError: (error, eventId) => {
      setEventResults(prev => [...prev, { event: eventId, success: false, error: error.message }]);
    },
  });

  // Bulk link all events
  const bulkLinkMutation = useMutation({
    mutationFn: async () => {
      setEventResults([]);
      const results: LinkResult[] = [];
      
      for (const event of events) {
        try {
          const response = await supabase.functions.invoke('link-event-sections', {
            body: { event_id: event.id, generate_inventory: true, tickets_per_section: 15 },
          });
          if (response.error) throw response.error;
          results.push({ ...response.data, success: true });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          results.push({ event: event.title, success: false, error: errorMessage });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      setEventResults(results);
      const successCount = results.filter(r => r.success).length;
      const totalSections = results.reduce((sum, r) => sum + (r.created_event_sections || 0), 0);
      toast.success(`Processed ${successCount}/${results.length} events: ${totalSections} sections linked`);
    },
    onError: (error) => {
      toast.error(`Bulk link failed: ${error.message}`);
    },
  });

  const getVenueStats = (venueId: string) => {
    return sectionStats.find(s => s.venue_id === venueId) || { total: 0, linked: 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Section SVG Sync</h1>
          <p className="text-muted-foreground">
            Link database sections to SVG map elements for interactive venue maps
          </p>
        </div>
      </div>

      <Tabs defaultValue="venues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="venues">
            <MapPin className="w-4 h-4 mr-2" />
            Venues ({venues.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events ({events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Venue Section Sync</CardTitle>
                <CardDescription>
                  Extract section IDs from SVG maps and create database sections
                </CardDescription>
              </div>
              <Button
                onClick={() => syncVenueMutation.mutate(undefined)}
                disabled={syncVenueMutation.isPending}
              >
                {syncVenueMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Sync All Venues
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScrollArea className="h-[400px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Sections</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingVenues ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : venues.map((venue) => {
                        const stats = getVenueStats(venue.id);
                        const allLinked = stats.total > 0 && stats.linked === stats.total;
                        
                        return (
                          <TableRow key={venue.id}>
                            <TableCell>
                              <p className="font-medium text-sm">{venue.name}</p>
                              <p className="text-xs text-muted-foreground">{venue.city}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={allLinked ? 'default' : stats.linked > 0 ? 'secondary' : 'outline'}>
                                {stats.linked}/{stats.total}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedVenue(venue.id);
                                  syncVenueMutation.mutate(venue.id);
                                }}
                                disabled={syncVenueMutation.isPending}
                              >
                                {syncVenueMutation.isPending && selectedVenue === venue.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Sync Results</h4>
                  {venueResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Click "Sync All Venues" to see results
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {venueResults.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                          <div>
                            <p className="font-medium">{result.venue}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.svg_sections_found} found, {result.created} created
                            </p>
                          </div>
                          {result.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event Section Linking</CardTitle>
                <CardDescription>
                  Link events to mappable sections and generate inventory
                </CardDescription>
              </div>
              <Button
                onClick={() => bulkLinkMutation.mutate()}
                disabled={bulkLinkMutation.isPending}
              >
                {bulkLinkMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Link All Events
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScrollArea className="h-[400px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingEvents ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : events.slice(0, 50).map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.event_date}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {event.venue?.name}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => linkEventMutation.mutate(event.id)}
                              disabled={linkEventMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Link Results</h4>
                  {eventResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Click "Link All Events" to process events
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {eventResults.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                          <div>
                            <p className="font-medium">{result.event}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.success 
                                ? `${result.created_event_sections} sections, ${result.created_inventory_items} inventory`
                                : result.error}
                            </p>
                          </div>
                          {result.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectionSync;
