import { BookOpen, Clock, MessageSquare, UserX, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getStats } from '../../api/admin.api';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getErrorMessage } from '../../utils/helpers';

const CARDS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'pendingUsers', label: 'Pending users', icon: Clock },
  { key: 'bannedUsers', label: 'Banned users', icon: UserX },
  { key: 'recipes', label: 'Recipes', icon: BookOpen },
  { key: 'reviews', label: 'Reviews', icon: MessageSquare },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <EmptyState title="Couldn't load stats" message="Please refresh the page." />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <div key={key} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon size={24} /></span>
          <div>
            <p className="text-2xl font-bold">{stats[key] ?? 0}</p>
            <p className="text-sm text-ink/60">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}