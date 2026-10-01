import { Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getFollowers, getFollowing } from '../../api/social.api';
import { getMyFavorites, getMyProfile, getMyRecipes, updateMyProfile } from '../../api/user.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import RecipeGrid from '../../components/recipe/RecipeGrid';
import UserCard, { Avatar } from '../../components/social/UserCard';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

const field = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary';

// Lists followers or following with "Load more"
function FollowListModal({ kind, userId, onClose }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcher = kind === 'followers' ? getFollowers : getFollowing;

  const load = useCallback(async (page) => {
    setLoading(true);
    try {
      const d = await fetcher(userId, { page, limit: 20 });
      setUsers((prev) => (page === 1 ? d.users : [...prev, ...d.users]));
      setPagination(d.pagination);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fetcher, userId]);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <Modal open onClose={onClose} title={kind === 'followers' ? 'Followers' : 'Following'} size="sm">
      {users.length === 0 && !loading && <p className="py-6 text-center text-sm text-ink/60">No users yet.</p>}
      {users.map((u) => <UserCard key={u.id} user={u} onNavigate={onClose} />)}
      {loading && <Loader />}
      {!loading && pagination && pagination.page < pagination.totalPages && (
        <div className="mt-2 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => load(pagination.page + 1)}>Load more</Button>
        </div>
      )}
    </Modal>
  );
}

export default function MyProfilePage() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null); // { user, counts }
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [followModal, setFollowModal] = useState(null);

  const [tab, setTab] = useState('recipes');
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    setListLoading(true);
    (tab === 'recipes' ? getMyRecipes : getMyFavorites)({ page, limit: 8 })
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
  }, [tab, page]);

  const startEdit = () => {
    setForm({ name: profile.user.name, bio: profile.user.bio || '' });
    setAvatarFile(null);
    setEditing(true);
  };

  const pickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (f.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller');
    setAvatarFile(f);
  };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('bio', form.bio.trim());
    if (avatarFile) fd.append('avatar', avatarFile);
    setSaving(true);
    try {
      const { user } = await updateMyProfile(fd);
      setProfile((p) => ({ ...p, user }));
      setUser(user); // keep the topbar avatar / name in sync
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <EmptyState title="Couldn't load your profile" message="Please refresh the page." />;
  const { user, counts } = profile;

  const stat = (label, value, onClick) => (
    <button disabled={!onClick} onClick={onClick} className="text-center enabled:hover:text-primary">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-ink/60">{label}</p>
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar user={user} size={88} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-ink/60">{user.email}</p>
            {user.bio && <p className="mt-2 whitespace-pre-line text-sm">{user.bio}</p>}
          </div>
          <div className="flex gap-6">
            {stat('Recipes', counts.recipes)}
            {stat('Favorites', counts.favorites)}
            {stat('Followers', counts.followers, () => setFollowModal('followers'))}
            {stat('Following', counts.following, () => setFollowModal('following'))}
          </div>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" className="mt-4" onClick={startEdit}><Pencil size={14} /> Edit profile</Button>
        )}

        {editing && (
          <form onSubmit={save} className="mt-5 space-y-3 border-t border-line pt-5">
            <div>
              <label htmlFor="p-name" className="mb-1 block text-sm font-medium">Name</label>
              <input id="p-name" required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-bio" className="mb-1 block text-sm font-medium">Bio</label>
              <textarea id="p-bio" rows={3} className={field} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-avatar" className="mb-1 block text-sm font-medium">Avatar</label>
              <input id="p-avatar" type="file" accept="image/*" onChange={pickAvatar} className="text-sm" />
              {avatarFile && <p className="mt-1 text-xs text-ink/60">Selected: {avatarFile.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Save changes</Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            </div>
          </form>
        )}
      </section>

      <div className="mb-5 mt-8 flex gap-6 border-b border-line">
        {[['recipes', 'My Recipes'], ['favorites', 'Favorites']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium ${tab === key ? 'border-primary text-primary' : 'border-transparent text-ink/60'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <RecipeGrid
        recipes={recipes}
        loading={listLoading}
        emptyTitle={tab === 'recipes' ? 'No recipes yet' : 'No favorites yet'}
        emptyMessage={tab === 'recipes' ? 'Recipes you publish will show up here.' : 'Bookmarked recipes will show up here.'}
      />
      {!listLoading && <Pagination pagination={pagination} onChange={setPage} />}

      {followModal && <FollowListModal kind={followModal} userId={user.id} onClose={() => setFollowModal(null)} />}
    </div>
  );
}