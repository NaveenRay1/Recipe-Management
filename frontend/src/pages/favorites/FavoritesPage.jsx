import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { getFavorites } from '../../api/favorite.api';
import Pagination from '../../components/common/Pagination';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import { useFavorites } from '../../context/FavoritesContext';
import { getErrorMessage } from '../../utils/helpers';

export default function FavoritesPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page')) || 1;
  const { favoriteIds, loading: favsLoading } = useFavorites();
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getFavorites({ page, limit: 12 })
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
  }, [page]);

  // Un-bookmarking here removes the card right away (the context already updated optimistically)
  const visible = favsLoading ? recipes : recipes.filter((r) => favoriteIds.has(r.id));

  return (
    <div>
      <h1 className="mb-6 flex items-baseline gap-3 text-2xl font-bold">
        Favorites <span className="text-base font-medium text-primary">{pagination?.total ?? 0} recipes</span>
      </h1>
      <RecipeGrid
        recipes={visible}
        loading={loading}
        emptyTitle="No favorites yet"
        emptyMessage="Tap the bookmark on any recipe to save it here."
        emptyAction={<Link to="/" className="inline-flex items-center gap-1 font-medium text-primary"><Bookmark size={16} /> Browse recipes</Link>}
      />
      {!loading && <Pagination pagination={pagination} onChange={(p) => setParams({ page: String(p) })} />}
    </div>
  );
}