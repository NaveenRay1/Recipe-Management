import { BookOpen, Utensils } from 'lucide-react';

// `active` is a category slug, or '' for "All Recipes".
export default function CategoryTabs({ categories, active, onChange }) {
  const tabs = [{ slug: '', name: 'All Recipes', icon: BookOpen }, ...categories.map((c) => ({ ...c, icon: Utensils }))];
  return (
    <div className="flex gap-6 overflow-x-auto pb-2" role="tablist">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.slug;
        return (
          <button
            key={t.slug || 'all'}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.slug)}
            className={`flex shrink-0 flex-col items-center gap-2 border-b-2 px-1 pb-2 text-sm ${
              isActive ? 'border-primary font-medium text-primary' : 'border-transparent text-ink/70 hover:text-ink'
            }`}
          >
            <Icon size={30} strokeWidth={1.5} />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}