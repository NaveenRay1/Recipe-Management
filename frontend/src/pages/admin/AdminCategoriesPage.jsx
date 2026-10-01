import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../api/category.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getErrorMessage } from '../../utils/helpers';

const field = 'rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const c = await createCategory(name.trim());
      setCategories((list) => [...list, c]);
      setName('');
      toast.success('Category added');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setSavingId(id);
    try {
      const c = await updateCategory(id, editName.trim());
      setCategories((list) => list.map((x) => (x.id === id ? c : x)));
      setEditId(null);
      toast.success('Category renamed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id);
      setCategories((list) => list.filter((x) => x.id !== toDelete.id));
      toast.success('Category deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={add} className="mb-5 flex gap-2">
        <input aria-label="New category name" placeholder="New category name" className={`${field} flex-1`} value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" loading={adding} disabled={!name.trim()}><Plus size={16} /> Add</Button>
      </form>

      {loading ? <Loader /> : categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Add the first one above." />
      ) : (
        <ul className="divide-y divide-line rounded-2xl bg-white shadow-sm">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              {editId === c.id ? (
                <>
                  <input aria-label="Category name" autoFocus className={`${field} flex-1`} value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(c.id)} />
                  <div className="flex gap-1">
                    <Button size="sm" loading={savingId === c.id} onClick={() => saveEdit(c.id)} aria-label="Save"><Check size={16} /></Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)} aria-label="Cancel"><X size={16} /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-ink/50">{c.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <button aria-label={`Rename ${c.name}`} onClick={() => { setEditId(c.id); setEditName(c.name); }} className="rounded-lg p-2 hover:bg-primary-soft"><Pencil size={16} /></button>
                    <button aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        title="Delete category?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm">"{toDelete?.name}" will be deleted permanently.</p>
      </Modal>
    </div>
  );
}