import { UtensilsCrossed } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import RecipeCard from './RecipeCard';

export default function RecipeGrid({
  recipes,
  loading,
  emptyTitle = 'No recipes found',
  emptyMessage = 'Try changing your filters or search.',
  emptyAction,
  renderActions,
}) {
  if (loading) return <Loader />;
  if (!recipes.length) {
    return <EmptyState icon={UtensilsCrossed} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} actions={renderActions?.(r)} />
      ))}
    </div>
  );
}