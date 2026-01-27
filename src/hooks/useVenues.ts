import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Fetch all venues
export function useVenues() {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch a single venue by ID with sections
export function useVenue(id: string | undefined) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Fetch sections for a venue
export function useVenueSections(venueId: string | undefined) {
  return useQuery({
    queryKey: ['venue-sections', venueId],
    queryFn: async () => {
      if (!venueId) return [];

      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('venue_id', venueId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!venueId,
  });
}

// Create venue mutation
export function useCreateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (venue: TablesInsert<'venues'>) => {
      const { data, error } = await supabase
        .from('venues')
        .insert(venue)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Update venue mutation
export function useUpdateVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...venue }: TablesUpdate<'venues'> & { id: string }) => {
      const { data, error } = await supabase
        .from('venues')
        .update(venue)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue', variables.id] });
    },
  });
}

// Delete venue mutation
export function useDeleteVenue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Create section mutation
export function useCreateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (section: TablesInsert<'sections'>) => {
      const { data, error } = await supabase
        .from('sections')
        .insert(section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-sections', variables.venue_id] });
    },
  });
}

// Update section mutation
export function useUpdateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...section }: TablesUpdate<'sections'> & { id: string }) => {
      const { data, error } = await supabase
        .from('sections')
        .update(section)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venue-sections', data.venue_id] });
    },
  });
}

// Delete section mutation
export function useDeleteSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, venueId }: { id: string; venueId: string }) => {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return venueId;
    },
    onSuccess: (venueId) => {
      queryClient.invalidateQueries({ queryKey: ['venue-sections', venueId] });
    },
  });
}
