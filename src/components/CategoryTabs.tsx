import { Music, Trophy, Theater, Laugh } from 'lucide-react';

const categoryIcons = {
  concerts: Music,
  sports: Trophy,
  theater: Theater,
  comedy: Laugh,
};

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Events' },
  { id: 'concerts', name: 'Concerts' },
  { id: 'sports', name: 'Sports' },
  { id: 'theater', name: 'Theater' },
  { id: 'comedy', name: 'Comedy' },
];

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => {
        const Icon = category.id !== 'all' ? categoryIcons[category.id as keyof typeof categoryIcons] : null;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-pill flex items-center gap-2 ${
              isActive ? 'category-pill-active' : 'category-pill-inactive'
            }`}
          >
            {Icon && <Icon size={16} />}
            {category.name}
          </button>
        );
      })}
    </div>
  );
};
