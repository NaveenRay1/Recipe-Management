import { Check, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { addRecipeToCollection, createCollection, getCollections } from '../../api/collection.api';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import Modal from '../common/Modal';

export default function AddToCollectionModal({ open, onClose, recipeId }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(() => new Set()); // collections added to during this session
  const [pendingId, setPendingId] = useState(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getCollections()
      .then(setCollections)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [open]);

  const add = async (id) => {
    setPendingId(id);
    try {
      await addRecipeToCollection(id, recipeId);
      setAdded((s) => new Set(s).add(id));
      toast.success('Added to collection');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setPendingId(null);
    }
  };

  // Create a collection inline, then add the recipe to it
  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const c = await createCollection({ name: name.trim() });
      setCollections((list) => [{ ...c, recipesCount: 0 }, ...list]);
      setName('');
      await add(c.id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to collection" size="sm">
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name"
          aria-label="New collection name"
          className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="sm" loading={creating} disabled={!name.trim()}><Plus size={16} /> Create</Button>
      </form>

      {loading ? <Loader /> : collections.length === 0 ? (
        <EmptyState title="No collections yet" message="Create one above to save this recipe." />
      ) : (
        <ul className="space-y-2">
          {collections.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
              <span className="truncate text-sm font-medium">{c.name}</span>
              {added.has(c.id) ? (
                <span className="flex items-center gap-1 text-sm text-green-600"><Check size={16} /> Added</span>
              ) : (
                <Button variant="outline" size="sm" loading={pendingId === c.id} onClick={() => add(c.id)}>Add</Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}