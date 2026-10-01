import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { addFavorite, getFavorites, removeFavorite } from '../api/favorite.api';
import useAuth from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const pending = useRef(new Set()); // ignore double clicks while a request is in flight

  // Load ALL favorites (page through with limit=50) whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const all = new Set();
        let page = 1;
        let totalPages = 1;
        do {
          const data = await getFavorites({ page, limit: 50 });
          data.recipes.forEach((r) => all.add(r.id));
          totalPages = data.pagination?.totalPages || 1;
          page += 1;
        } while (page <= totalPages);
        if (active) setIds(all);
      } catch (err) {
        if (active) toast.error(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFavorite = useCallback((id) => ids.has(id), [ids]);

  // Optimistic update with rollback on error. Returns the resulting state (true = favorited).
  const toggleFavorite = useCallback(
    async (id) => {
      if (pending.current.has(id)) return ids.has(id);
      pending.current.add(id);
      const wasFav = ids.has(id);
      const apply = (fav) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (fav) next.add(id);
          else next.delete(id);
          return next;
        });
      apply(!wasFav);
      try {
        if (wasFav) await removeFavorite(id);
        else await addFavorite(id);
        return !wasFav;
      } catch (err) {
        apply(wasFav);
        toast.error(getErrorMessage(err));
        return wasFav;
      } finally {
        pending.current.delete(id);
      }
    },
    [ids]
  );

  const value = useMemo(
    () => ({ favoriteIds: ids, loading, isFavorite, toggleFavorite }),
    [ids, loading, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}