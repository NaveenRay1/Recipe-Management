import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { getUser, getUserRecipes } from '../../api/user.api';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import FollowButton from '../../components/social/FollowButton';
import { Avatar } from '../../components/social/UserCard';
import { formatDate, getErrorMessage } from '../../utils/helpers';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null); // { user, counts, isFollowing }
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setPage(1);
    getUser(id)
      .then((d) => active && setProfile(d))
      .catch((e) => {
        if (!active) return;
        setFailed(true);
        toast.error(getErrorMessage(e));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    setListLoading(true);
    getUserRecipes(id, { page, limit: 12 })
      .then((d) => {
        if (!active) return;
        setRecipes(d.recipes);
        setPagination(d.pagination);
      })
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setListLoading(false));
    return () => {
      active = false;
    };
  }, [id, page]);

  if (loading) return <Loader />;
  if (failed || !profile) {
    return <EmptyState title="User not found" action={<Link to="/" className="font-medium text-primary">Back to recipes</Link>} />;
  }
  const { user, counts, isFollowing } = profile;

  // Keep the follower count in step with the button
  const onFollowChange = (nowFollowing) =>
    setProfile((p) => ({
      ...p,
      isFollowing: nowFollowing,
      counts: { ...p.counts, followers: p.counts.followers + (nowFollowing ? 1 : -1) },
    }));

  return (
    <div className="mx-auto max-w-5xl">
      <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <Avatar user={user} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          {user.bio && <p className="mt-1 whitespace-pre-line text-sm">{user.bio}</p>}
          <p className="mt-1 text-xs text-ink/50">Joined {formatDate(user.createdAt)}</p>
        </div>
        <div className="flex gap-6 text-center">
          {[['Recipes', counts.recipes], ['Followers', counts.followers], ['Following', counts.following]].map(([l, v]) => (
            <div key={l}>
              <p className="text-xl font-bold">{v}</p>
              <p className="text-xs text-ink/60">{l}</p>
            </div>
          ))}
        </div>
        <FollowButton userId={user.id} initialFollowing={isFollowing} onChange={onFollowChange} size="md" />
      </section>

      <h2 className="mb-4 mt-8 text-xl font-semibold">Recipes by {user.name}</h2>
      <RecipeGrid recipes={recipes} loading={listLoading} emptyTitle="No recipes yet" emptyMessage={`${user.name} hasn't published anything yet.`} />
      {!listLoading && <Pagination pagination={pagination} onChange={setPage} />}
    </div>
  );
}