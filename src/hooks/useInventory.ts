import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Fetch all ticket inventory with relations
export function useInventory(options?: { eventId?: string; status?: string }) {
  return useQuery({
    queryKey: ['inventory', options],
    queryFn: async () => {
      let query = supabase
        .from('ticket_inventory')
        .select(`
          *,
          event_section:event_sections(
            *,
            event:events(id, title, event_date),
            section:sections(id, name, venue_id)
          )
        `)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by eventId if provided
      let inventory = data || [];
      if (options?.eventId) {
        inventory = inventory.filter(
          (item: any) => item.event_section?.event_id === options.eventId
        );
      }

      return inventory;
    },
  });
}

// Fetch inventory for a specific event section
export function useEventSectionInventory(eventSectionId: string | undefined) {
  return useQuery({
    queryKey: ['inventory', 'event-section', eventSectionId],
    queryFn: async () => {
      if (!eventSectionId) return [];

      const { data, error } = await supabase
        .from('ticket_inventory')
        .select('*')
        .eq('event_section_id', eventSectionId)
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!eventSectionId,
  });
}

// Create inventory item mutation
export function useCreateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inventory: TablesInsert<'ticket_inventory'>) => {
      const { data, error } = await supabase
        .from('ticket_inventory')
        .insert(inventory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Update inventory item mutation
export function useUpdateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...inventory }: TablesUpdate<'ticket_inventory'> & { id: string }) => {
      const { data, error } = await supabase
        .from('ticket_inventory')
        .update(inventory)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Delete inventory item mutation
export function useDeleteInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ticket_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Bulk update prices for a section
export function useBulkUpdateInventoryPrices() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventSectionId, newPrice }: { eventSectionId: string; newPrice: number }) => {
      const { error } = await supabase
        .from('ticket_inventory')
        .update({ price: newPrice })
        .eq('event_section_id', eventSectionId)
        .eq('status', 'available');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
