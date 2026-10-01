import { FolderHeart, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImage } from '../../utils/helpers';

export default function CollectionCard({ collection, onRename, onDelete }) {
  const covers = (collection.recipes || []).slice(0, 4);
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <Link to={`/collections/${collection.id}`} className="grid aspect-[2/1] grid-cols-4 bg-primary-soft">
        {covers.length === 0 ? (
          <span className="col-span-4 flex items-center justify-center text-primary/60"><FolderHeart size={36} /></span>
        ) : (
          covers.map((r) => {
            const src = resolveImage(r.image);
            return src ? (
              <img key={r.id} src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <span key={r.id} className="bg-ink/10" />
            );
          })
        )}
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link to={`/collections/${collection.id}`} className="block truncate font-semibold hover:text-primary">{collection.name}</Link>
          <p className="text-sm text-ink/60">{collection.recipesCount} recipe{collection.recipesCount === 1 ? '' : 's'}</p>
          {collection.description && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{collection.description}</p>}
        </div>
        <div className="flex shrink-0">
          <button aria-label="Rename collection" onClick={() => onRename(collection)} className="rounded-lg p-2 hover:bg-primary-soft"><Pencil size={16} /></button>
          <button aria-label="Delete collection" onClick={() => onDelete(collection)} className="rounded-lg p-2 hover:bg-primary-soft"><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  );
}