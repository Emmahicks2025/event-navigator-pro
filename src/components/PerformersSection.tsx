import { useState } from 'react';
import { PerformerCard } from './PerformerCard';
import { CategoryTabs } from './CategoryTabs';
import { performers } from '@/data/mockData';

export const PerformersSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPerformers = activeCategory === 'all'
    ? performers
    : performers.filter((p) => p.category === activeCategory);

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h2 className="text-3xl font-bold text-foreground">Top Performer Picks</h2>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {filteredPerformers.map((performer) => (
            <PerformerCard key={performer.id} performer={performer} />
          ))}
        </div>
      </div>
    </section>
  );
};
