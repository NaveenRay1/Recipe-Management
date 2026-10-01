import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { deleteAdminRecipe, getAdminRecipes } from '../../api/admin.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import useDebounce from '../../hooks/useDebounce';
import { formatDate, formatRating, getErrorMessage } from '../../utils/helpers';

const th = 'px-4 py-3 text-left text-xs font-medium text-ink/60';
const td = 'px-4 py-3 text-sm';

export default function AdminRecipesPage() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 400);
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (dq.trim()) params.q = dq.trim();
      const d = await getAdminRecipes(params);
      if (!d.recipes.length && page > 1) return setPage(page - 1);
      setRecipes(d.recipes);
      setPagination(d.pagination);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
    return undefined;
  }, [dq, page]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminRecipe(toDelete.id);
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
      <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search recipes" className="mb-4 max-w-md" />

      {loading ? <Loader /> : recipes.length === 0 ? (
        <EmptyState title="No recipes found" message="Try a different search." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-line">
              <tr><th className={th}>Title</th><th className={th}>Author</th><th className={th}>Rating</th><th className={th}>Created</th><th className={th}>Actions</th></tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className={`${td} font-medium`}><Link to={`/recipes/${r.id}`} className="hover:text-primary">{r.title}</Link></td>
                  <td className={td}>{r.author?.name}</td>
                  <td className={td}>{formatRating(r.avgRating)} ({r.ratingCount})</td>
                  <td className={td}>{formatDate(r.createdAt)}</td>
                  <td className={td}><Button size="sm" variant="danger" onClick={() => setToDelete(r)}><Trash2 size={14} /> Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && <Pagination pagination={pagination} onChange={setPage} />}

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
        <p className="text-sm">"{toDelete?.title}" by {toDelete?.author?.name} will be deleted permanently.</p>
      </Modal>
    </div>
  );
}