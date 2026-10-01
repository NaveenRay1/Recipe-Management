import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteRecipe } from '../../api/recipe.api';
import { getMyRecipes } from '../../api/user.api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import { getErrorMessage } from '../../utils/helpers';

export default function MyRecipesPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page')) || 1;
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyRecipes({ page, limit: 12 });
      // Deleted the last item on a page: step back one page
      if (!data.recipes.length && page > 1) return setParams({ page: String(page - 1) });
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
    return undefined;
  }, [page, setParams]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(toDelete.id);
      toast.success('Recipe deleted');
      setToDelete(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-baseline gap-3 text-2xl font-bold">
          My Recipes <span className="text-base font-medium text-primary">{pagination?.total ?? 0} recipes</span>
        </h1>
        <Link to="/recipes/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
          <Plus size={16} /> Add a Recipe
        </Link>
      </div>

      <RecipeGrid
        recipes={recipes}
        loading={loading}
        emptyTitle="You haven't added any recipes yet"
        emptyMessage="Share your first recipe with the community."
        emptyAction={<Link to="/recipes/new" className="font-medium text-primary">Add a Recipe</Link>}
        renderActions={(r) => (
          <>
            <Link to={`/recipes/${r.id}/edit`} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line py-1.5 text-sm hover:bg-primary-soft">
              <Pencil size={14} /> Edit
            </Link>
            <button onClick={() => setToDelete(r)} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line py-1.5 text-sm text-red-600 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      />
      {!loading && <Pagination pagination={pagination} onChange={(p) => setParams({ page: String(p) })} />}

      <Modal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        title="Delete recipe?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm">"{toDelete?.title}" will be deleted permanently.</p>
      </Modal>
    </div>
  );
}