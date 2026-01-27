import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithCount, transformDbCategoryToCategory } from '@/types/database';
import { Category } from '@/types/event';

// Fetch all categories with event counts
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      // First get all categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // Then get event counts per category
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('category_id')
        .eq('is_active', true);

      if (eventsError) throw eventsError;

      // Count events per category
      const countMap = new Map<string, number>();
      events?.forEach(event => {
        if (event.category_id) {
          countMap.set(event.category_id, (countMap.get(event.category_id) || 0) + 1);
        }
      });

      // Add counts to categories
      const categoriesWithCounts: CategoryWithCount[] = (categories || []).map(cat => ({
        ...cat,
        events_count: countMap.get(cat.id) || 0,
      }));

      return categoriesWithCounts.map(transformDbCategoryToCategory);
    },
  });
}

// Fetch a single category by slug
export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
