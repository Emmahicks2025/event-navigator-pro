import { useState } from 'react';
import { PerformerCard } from './PerformerCard';
import { CategoryTabs } from './CategoryTabs';
import { usePerformers } from '@/hooks/usePerformers';
import { Skeleton } from '@/components/ui/skeleton';

export const PerformersSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { data: performers = [], isLoading } = usePerformers({ category: activeCategory, limit: 6 });

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h2 className="text-3xl font-bold text-foreground">Top Performer Picks</h2>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-24 h-24 mx-auto rounded-full mb-3" />
                <Skeleton className="h-4 w-20 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : performers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {performers.map((performer) => (
              <PerformerCard key={performer.id} performer={performer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No performers found in this category
          </div>
        )}
      </div>
    </section>
  );
};
