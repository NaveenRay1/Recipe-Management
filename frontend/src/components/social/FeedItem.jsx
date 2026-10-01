import { ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, resolveImage } from '../../utils/helpers';
import StarRating from '../review/StarRating';
import { Avatar } from './UserCard';

export default function FeedItem({ item }) {
  const { actor, recipe, review, type } = item;
  const img = resolveImage(recipe?.image);

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar user={actor} size={40} />
        <div className="min-w-0">
          <p className="text-sm">
            <Link to={`/users/${actor.id}`} className="font-semibold hover:text-primary">{actor.name}</Link>{' '}
            {type === 'review' && review ? (
              <>
                rated{' '}
                <Link to={`/recipes/${recipe.id}`} className="font-semibold hover:text-primary">{recipe.title}</Link>{' '}
                {review.rating} star{review.rating === 1 ? '' : 's'}
              </>
            ) : (
              'published a new recipe'
            )}
          </p>
          <p className="text-xs text-ink/50">{formatDate(item.createdAt)}</p>
        </div>
      </div>

      {type === 'review' && review && (
        <div className="mt-3">
          <StarRating value={review.rating} size={16} />
          {review.comment && <p className="mt-1 whitespace-pre-line text-sm">{review.comment}</p>}
        </div>
      )}

      {recipe && (
        <Link to={`/recipes/${recipe.id}`} className="mt-3 flex items-center gap-3 rounded-xl border border-line p-2 hover:bg-primary-soft/50">
          {img ? (
            <img src={img} alt="" className="h-16 w-20 rounded-lg object-cover" />
          ) : (
            <span className="flex h-16 w-20 items-center justify-center rounded-lg bg-primary-soft text-ink/30"><ImageOff size={22} /></span>
          )}
          <span className="font-medium">{recipe.title}</span>
        </Link>
      )}
    </article>
  );
}