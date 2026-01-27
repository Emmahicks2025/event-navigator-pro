import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PerformerWithCount, transformDbPerformerToPerformer, DbPerformer } from '@/types/database';
import { Performer } from '@/types/event';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Fetch all performers with event counts
export function usePerformers(options?: { category?: string; limit?: number }) {
  return useQuery({
    queryKey: ['performers', options],
    queryFn: async (): Promise<Performer[]> => {
      let query = supabase
        .from('performers')
        .select(`
          *,
          category:categories(slug)
        `)
        .order('name', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: performers, error: perfError } = await query;

      if (perfError) throw perfError;

      // Get event counts per performer
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('performer_id')
        .eq('is_active', true);

      if (eventsError) throw eventsError;

      const countMap = new Map<string, number>();
      events?.forEach(event => {
        if (event.performer_id) {
          countMap.set(event.performer_id, (countMap.get(event.performer_id) || 0) + 1);
        }
      });

      // Filter by category if provided
      let result = (performers || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        category: (p.category?.slug as 'concerts' | 'sports' | 'theater' | 'comedy') || 'concerts',
        eventsCount: countMap.get(p.id) || 0,
      }));

      if (options?.category && options.category !== 'all') {
        result = result.filter(p => p.category === options.category);
      }

      return result;
    },
  });
}

// Fetch all performers for admin (raw data)
export function useAdminPerformers() {
  return useQuery({
    queryKey: ['admin-performers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performers')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Create performer mutation
export function useCreatePerformer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (performer: TablesInsert<'performers'>) => {
      const { data, error } = await supabase
        .from('performers')
        .insert(performer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
    },
  });
}

// Update performer mutation
export function useUpdatePerformer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...performer }: TablesUpdate<'performers'> & { id: string }) => {
      const { data, error } = await supabase
        .from('performers')
        .update(performer)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
    },
  });
}

// Delete performer mutation
export function useDeletePerformer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('performers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
    },
  });
}
