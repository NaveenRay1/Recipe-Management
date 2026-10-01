import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { getCollection, removeRecipeFromCollection } from '../../api/collection.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import { getErrorMessage } from '../../utils/helpers';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCollection(id)
      .then((c) => active && setCollection(c))
      .catch((e) => {
        if (!active) return;
        setFailed(true);
        toast.error(getErrorMessage(e));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await removeRecipeFromCollection(id, toRemove.id);
      setCollection((c) => ({ ...c, recipes: c.recipes.filter((r) => r.id !== toRemove.id) }));
      toast.success('Removed from collection');
      setToRemove(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <Loader />;
  if (failed || !collection) {
    return <EmptyState title="Collection not found" action={<Link to="/collections" className="font-medium text-primary">Back to collections</Link>} />;
  }

  return (
    <div>
      <Link to="/collections" className="mb-3 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-primary">
        <ArrowLeft size={16} /> Collections
      </Link>
      <h1 className="text-2xl font-bold">{collection.name}</h1>
      {collection.description && <p className="mt-1 text-ink/60">{collection.description}</p>}
      <p className="mb-6 mt-1 text-sm font-medium text-primary">{collection.recipes.length} recipes</p>

      <RecipeGrid
        recipes={collection.recipes}
        loading={false}
        emptyTitle="This collection is empty"
        emptyMessage="Open a recipe and use “Add to collection”."
        emptyAction={<Link to="/" className="font-medium text-primary">Browse recipes</Link>}
        renderActions={(r) => (
          <button onClick={() => setToRemove(r)} className="flex w-full items-center justify-center gap-1 rounded-xl border border-line py-1.5 text-sm text-red-600 hover:bg-red-50">
            <X size={14} /> Remove
          </button>
        )}
      />

      <Modal
        open={!!toRemove}
        onClose={() => !removing && setToRemove(null)}
        title="Remove from collection?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToRemove(null)} disabled={removing}>Cancel</Button>
            <Button variant="danger" onClick={confirmRemove} loading={removing}>Remove</Button>
          </>
        }
      >
        <p className="text-sm">"{toRemove?.title}" stays on the site; it is only removed from this collection.</p>
      </Modal>
    </div>
  );
}