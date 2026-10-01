import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsers, setUserStatus } from '../../api/admin.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const BADGE = { active: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', banned: 'bg-red-100 text-red-700' };
const th = 'px-4 py-3 text-left text-xs font-medium text-ink/60';
const td = 'px-4 py-3 text-sm';
const sel = 'rounded-xl border border-line bg-white px-3 py-2.5 text-sm';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 400);
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { page, limit: 10 };
    if (dq.trim()) params.q = dq.trim();
    if (status) params.status = status;
    if (role) params.role = role;
    getAdminUsers(params)
      .then((d) => {
        if (!active) return;
        setUsers(d.users);
        setPagination(d.pagination);
      })
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [dq, status, role, page]);

  const changeStatus = async (u, next) => {
    setPendingId(u.id);
    try {
      const updated = await setUserStatus(u.id, next);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, ...updated } : x)));
      toast.success(`${u.name} is now ${next}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setPendingId(null);
    }
  };

  const actions = (u) => {
    const locked = u.id === me.id || u.role === 'admin'; // cannot change self or other admins
    const btn = (label, next, variant) => (
      <Button key={next} size="sm" variant={variant} disabled={locked} loading={pendingId === u.id} onClick={() => changeStatus(u, next)}>
        {label}
      </Button>
    );
    if (u.status === 'pending') return [btn('Approve', 'active', 'primary'), btn('Ban', 'banned', 'danger')];
    if (u.status === 'banned') return [btn('Activate', 'active', 'primary')];
    return [btn('Ban', 'banned', 'danger')];
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name or email" className="min-w-60 flex-1" />
        <select aria-label="Status" className={sel} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>
        <select aria-label="Role" className={sel} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <Loader /> : users.length === 0 ? (
        <EmptyState title="No users found" message="Try a different search or filter." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-line">
              <tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Joined</th><th className={th}>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className={`${td} font-medium`}>{u.name}</td>
                  <td className={td}>{u.email}</td>
                  <td className={`${td} capitalize`}>{u.role}</td>
                  <td className={td}><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${BADGE[u.status]}`}>{u.status}</span></td>
                  <td className={td}>{formatDate(u.createdAt)}</td>
                  <td className={td}><div className="flex gap-2">{actions(u)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && <Pagination pagination={pagination} onChange={setPage} />}
    </div>
  );
}