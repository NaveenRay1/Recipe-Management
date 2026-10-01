import { Bookmark } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import useAuth from '../../hooks/useAuth';

export default function FavoriteButton({ recipeId, size = 22, className = '' }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const active = !!user && isFavorite(recipeId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login', { state: { from: location } });
    return toggleFavorite(recipeId);
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`rounded-lg p-1 text-primary hover:bg-primary-soft ${className}`}
    >
      <Bookmark size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}