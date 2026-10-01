import { BookmarkPlus, ChefHat, Clock, Flame, ImageOff, Pencil, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe } from '../../api/recipe.api';
import { createReview, deleteReview, getReviews, updateReview } from '../../api/review.api';
import { getUser } from '../../api/user.api';
import AddToCollectionModal from '../../components/collection/AddToCollectionModal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import FavoriteButton from '../../components/recipe/FavoriteButton';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewList from '../../components/review/ReviewList';
import StarRating from '../../components/review/StarRating';
import FollowButton from '../../components/social/FollowButton';
import { Avatar } from '../../components/social/UserCard';
import useAuth from '../../hooks/useAuth';
import { formatMinutes, formatRating, getErrorMessage, resolveImage } from '../../utils/helpers';

const REVIEW_LIMIT = 5;

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
      <Icon size={18} className="text-primary" />
      <div>
        <p className="text-xs text-ink/50">{label}</p>
        <p className="text-sm font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [collectionOpen, setCollectionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // silent = refetch without the full-page loader (used after review changes)
  const loadRecipe = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setRecipe(await getRecipe(id));
      setFailed(false);
    } catch (e) {
      if (!silent) setFailed(true);
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async (page) => {
    setReviewsLoading(true);
    try {
      const data = await getReviews(id, { page, limit: REVIEW_LIMIT });
      if (!data.reviews.length && page > 1) return setReviewPage(page - 1);
      setReviews(data.reviews);
      setReviewPagination(data.pagination);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setReviewsLoading(false);
    }
    return undefined;
  }, [id]);

  useEffect(() => {
    setReviewPage(1);
    loadRecipe();
  }, [loadRecipe]);

  useEffect(() => {
    loadReviews(reviewPage);
  }, [loadReviews, reviewPage]);

  // The recipe payload has no isFollowing, so read it from the author's profile
  useEffect(() => {
    if (!user || !recipe || recipe.author.id === user.id) return;
    getUser(recipe.author.id).then((d) => setIsFollowing(!!d.isFollowing)).catch(() => {});
  }, [user?.id, recipe?.author?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAfterReview = (goToFirstPage = false) => {
    loadRecipe(true); // updates avgRating and ratingCount
    if (goToFirstPage && reviewPage !== 1) setReviewPage(1);
    else loadReviews(reviewPage);
  };

  const handleCreate = async (payload) => {
    setPosting(true);
    try {
      await createReview(id, payload);
      toast.success('Review posted');
      refreshAfterReview(true);
    } catch (e) {
      toast.error(getErrorMessage(e)); // e.g. 409 already reviewed
    } finally {
      setPosting(false);
    }
  };
  const handleUpdate = async (reviewId, payload) => {
    try {
      await updateReview(reviewId, payload);
      toast.success('Review updated');
      refreshAfterReview();
      return true;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return false;
    }
  };
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      toast.success('Review deleted');
      refreshAfterReview();
      return true;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return false;
    }
  };

  const handleDeleteRecipe = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted');
      navigate('/');
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;
  if (failed || !recipe) {
    return <EmptyState title="Recipe not found" message="It may have been removed." action={<Link to="/" className="font-medium text-primary">Back to recipes</Link>} />;
  }

  const img = resolveImage(recipe.image);
  const canManage = !!user && (recipe.author.id === user.id || isAdmin);
  const isAuthor = !!user && recipe.author.id === user.id;
  // Only the loaded page is checked; the server still enforces one review per user (409)
  const hasReviewed = !!user && reviews.some((r) => r.userId === user.id);

  return (
    <article className="mx-auto max-w-4xl">
      <div className="aspect-video overflow-hidden rounded-2xl bg-primary-soft">
        {img ? (
          <img src={img} alt={recipe.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30"><ImageOff size={56} /></div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <div className="flex items-center gap-2">
          <FavoriteButton recipeId={recipe.id} size={26} />
          {user && (
            <Button variant="outline" size="sm" onClick={() => setCollectionOpen(true)}>
              <BookmarkPlus size={16} /> Add to collection
            </Button>
          )}
          {canManage && (
            <>
              <Link to={`/recipes/${recipe.id}/edit`} className="flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-1.5 text-sm hover:bg-primary-soft">
                <Pencil size={14} /> Edit
              </Link>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}><Trash2 size={14} /> Delete</Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link to={`/users/${recipe.author.id}`} className="flex items-center gap-2 hover:text-primary">
          <Avatar user={recipe.author} size={32} />
          <span className="text-sm font-medium">{recipe.author.name}</span>
        </Link>
        <FollowButton userId={recipe.author.id} initialFollowing={isFollowing} onChange={setIsFollowing} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {recipe.categories.map((c) => (
          <Link key={c.id} to={`/?category=${c.slug}`} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{c.name}</Link>
        ))}
        {recipe.isVegetarian && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Vegetarian</span>}
        {recipe.isVegan && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Vegan</span>}
        {recipe.isGlutenFree && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Gluten-free</span>}
      </div>

      {recipe.description && <p className="mt-4 text-ink/80">{recipe.description}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Clock} label="Prep" value={formatMinutes(recipe.prepTime)} />
        <Stat icon={Flame} label="Cook" value={formatMinutes(recipe.cookTime)} />
        <Stat icon={Users} label="Servings" value={recipe.servings || '—'} />
        <Stat icon={ChefHat} label="Difficulty" value={recipe.difficulty || '—'} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <StarRating value={recipe.avgRating} />
        <span className="font-medium">{formatRating(recipe.avgRating)}</span>
        <span className="text-ink/50">({recipe.ratingCount} rating{recipe.ratingCount === 1 ? '' : 's'})</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
          <ul className="space-y-2 text-sm">
            {recipe.ingredients.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                <span>{i.name}</span>
                <span className="text-ink/60">{i.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed">{recipe.instructions}</p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        {user && !isAuthor && !hasReviewed && (
          <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-medium">Write a review</h3>
            <ReviewForm onSubmit={handleCreate} submitting={posting} />
          </div>
        )}
        {!user && (
          <p className="mb-5 text-sm text-ink/60">
            <Link to="/login" state={{ from: { pathname: `/recipes/${id}` } }} className="font-medium text-primary">Log in</Link> to leave a review.
          </p>
        )}
        <ReviewList
          reviews={reviews}
          pagination={reviewPagination}
          loading={reviewsLoading}
          user={user}
          onPageChange={setReviewPage}
          onUpdate={handleUpdate}
          onDelete={handleDeleteReview}
        />
      </section>

      <AddToCollectionModal open={collectionOpen} onClose={() => setCollectionOpen(false)} recipeId={recipe.id} />

      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete recipe?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteRecipe} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm">"{recipe.title}" will be deleted permanently.</p>
      </Modal>
    </article>
  );
}