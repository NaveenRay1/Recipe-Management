import { Clock, ImageOff, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMinutes, formatRating, resolveImage, totalMinutes } from '../../utils/helpers';
import FavoriteButton from './FavoriteButton';

// `actions` is an optional node rendered under the card (e.g. Edit / Delete buttons).
export default function RecipeCard({ recipe, actions }) {
  const img = resolveImage(recipe.image);
  const category = recipe.categories?.[0]?.name;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <Link to={`/recipes/${recipe.id}`} className="relative block aspect-[4/3] bg-primary-soft">
        {img ? (
          <img src={img} alt={recipe.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30">
            <ImageOff size={36} />
          </div>
        )}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium shadow">
          <Clock size={14} /> {formatMinutes(totalMinutes(recipe))}
        </span>
      </Link>

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/recipes/${recipe.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-primary">
            {recipe.title}
          </Link>
          <FavoriteButton recipeId={recipe.id} className="-mr-1 -mt-1 shrink-0" />
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
          <span className="truncate">{category || 'Uncategorized'}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Star size={14} className="text-amber-500" fill="currentColor" /> {formatRating(recipe.avgRating)}
          </span>
        </p>
      </div>

      {actions && <div className="flex gap-2 border-t border-line px-4 py-3">{actions}</div>}
    </article>
  );
}