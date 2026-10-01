import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import { Avatar } from '../social/UserCard';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

// `onUpdate(id, payload)` and `onDelete(id)` must resolve to true on success.
export default function ReviewList({ reviews, pagination, loading, user, onPageChange, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (!reviews.length) return <EmptyState title="No reviews yet" message="Be the first to share what you think." />;

  const save = async (id, payload) => {
    setBusy(true);
    if (await onUpdate(id, payload)) setEditingId(null);
    setBusy(false);
  };
  const confirmDelete = async () => {
    setBusy(true);
    if (await onDelete(deleting.id)) setDeleting(null);
    setBusy(false);
  };

  return (
    <div>
      <ul className="space-y-4">
        {reviews.map((r) => {
          const mine = user?.id === r.userId;
          const canDelete = mine || user?.role === 'admin';
          return (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar user={r.user} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3">
                    <Link to={`/users/${r.user.id}`} className="font-medium hover:text-primary">{r.user.name}</Link>
                    <span className="text-xs text-ink/50">{formatDate(r.createdAt)}</span>
                  </div>
                  {editingId === r.id ? (
                    <div className="mt-2">
                      <ReviewForm initial={r} submitting={busy} onSubmit={(p) => save(r.id, p)} onCancel={() => setEditingId(null)} />
                    </div>
                  ) : (
                    <>
                      <StarRating value={r.rating} size={16} />
                      {r.comment && <p className="mt-1 whitespace-pre-line text-sm">{r.comment}</p>}
                    </>
                  )}
                </div>
                {editingId !== r.id && (
                  <div className="flex shrink-0 gap-1">
                    {mine && (
                      <button aria-label="Edit review" onClick={() => setEditingId(r.id)} className="rounded-lg p-2 hover:bg-primary-soft"><Pencil size={16} /></button>
                    )}
                    {canDelete && (
                      <button aria-label="Delete review" onClick={() => setDeleting(r)} className="rounded-lg p-2 hover:bg-primary-soft"><Trash2 size={16} /></button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Pagination pagination={pagination} onChange={onPageChange} />

      <Modal
        open={!!deleting}
        onClose={() => !busy && setDeleting(null)}
        title="Delete review?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-sm">This review will be removed permanently.</p>
      </Modal>
    </div>
  );
}