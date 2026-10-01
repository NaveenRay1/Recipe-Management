import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import StarRating from './StarRating';

// `onSubmit({ rating, comment })` should return a promise; `initial` pre-fills when editing.
export default function ReviewForm({ initial, onSubmit, onCancel, submitting = false }) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [comment, setComment] = useState(initial?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please choose a star rating');
    return onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <StarRating value={rating} onChange={setRating} size={26} />
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts (optional)"
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={submitting}>{initial ? 'Save review' : 'Post review'}</Button>
        {onCancel && <Button variant="outline" size="sm" onClick={onCancel} disabled={submitting}>Cancel</Button>}
      </div>
    </form>
  );
}