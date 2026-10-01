import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { getCategories } from '../../api/category.api';
import { getRecipes } from '../../api/recipe.api';
import Pagination from '../../components/common/Pagination';
import CategoryTabs from '../../components/recipe/CategoryTabs';
import RecipeFilters from '../../components/recipe/RecipeFilters';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import SortDropdown from '../../components/recipe/SortDropdown';
import { cleanParams, getErrorMessage } from '../../utils/helpers';

const FILTER_KEYS = ['vegetarian', 'vegan', 'glutenFree', 'difficulty', 'maxPrepTime', 'minRating'];
const LIMIT = 12;

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Everything lives in the URL so refresh / back / share work
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const activeFilters = FILTER_KEYS.filter((k) => filters[k]).length;

  const updateParams = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page'); // any other change returns to page 1
    setParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((k) => next.delete(k));
    next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    getCategories().then(setCategories).catch((e) => toast.error(getErrorMessage(e)));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRecipes(cleanParams({ q, category, sort, ...filters, page, limit: LIMIT }))
      .then((data) => {
        if (!active) return;
        setRecipes(data.recipes);
        setPagination(data.pagination);
      })
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-baseline gap-3 text-2xl font-bold">
          Browse Recipes
          <span className="text-base font-medium text-primary">{pagination?.total ?? 0} recipes</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm"
          >
            <SlidersHorizontal size={16} /> Filters
            {activeFilters > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-white">{activeFilters}</span>}
          </button>
          <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v === 'newest' ? '' : v })} />
        </div>
      </div>

      {showFilters && <RecipeFilters values={filters} onChange={updateParams} onClear={clearFilters} />}

      <div className="mb-6">
        <CategoryTabs categories={categories} active={category} onChange={(slug) => updateParams({ category: slug })} />
      </div>

      <RecipeGrid
        recipes={recipes}
        loading={loading}
        emptyMessage={q ? `Nothing matched "${q}". Try another search or clear your filters.` : 'Try changing your filters or category.'}
      />
      {!loading && <Pagination pagination={pagination} onChange={(p) => updateParams({ page: String(p) })} />}
    </div>
  );
}