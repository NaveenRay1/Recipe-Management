import { FolderHeart, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createCollection, deleteCollection, getCollections, updateCollection } from '../../api/collection.api';
import CollectionCard from '../../components/collection/CollectionCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getErrorMessage } from '../../utils/helpers';

const field = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null); // { collection | null } -> create when null
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setCollections(await getCollections());
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = (collection = null) => {
    setForm({ name: collection?.name || '', description: collection?.description || '' });
    setEditor({ collection });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (editor.collection) await updateCollection(editor.collection.id, payload);
      else await createCollection(payload);
      toast.success(editor.collection ? 'Collection updated' : 'Collection created');
      setEditor(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCollection(toDelete.id);
      toast.success('Collection deleted');
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button onClick={() => openEditor()}><Plus size={16} /> New collection</Button>
      </div>

      {loading ? <Loader /> : collections.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title="No collections yet"
          message="Group recipes into collections like “Weeknight dinners”."
          action={<Button onClick={() => openEditor()}>Create a collection</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} onRename={openEditor} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <Modal open={!!editor} onClose={() => !saving && setEditor(null)} title={editor?.collection ? 'Edit collection' : 'New collection'} size="sm">
        <form onSubmit={save} className="space-y-3">
          <div>
            <label htmlFor="c-name" className="mb-1 block text-sm font-medium">Name</label>
            <input id="c-name" required autoFocus className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-desc" className="mb-1 block text-sm font-medium">Description</label>
            <textarea id="c-desc" rows={3} className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditor(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        title="Delete collection?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm">"{toDelete?.name}" will be deleted. The recipes inside are not deleted.</p>
      </Modal>
    </div>
  );
}