import {
  BookOpen, Bookmark, ChefHat, FolderHeart, LayoutGrid, LogIn, LogOut, Plus, Rss, ShieldCheck, User, UserPlus, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const USER_ITEMS = [
  { to: '/', label: 'Browse', icon: LayoutGrid, end: true },
  { to: '/my-recipes', label: 'My Recipes', icon: BookOpen },
  { to: '/favorites', label: 'Favorites', icon: Bookmark },
  { to: '/collections', label: 'Collections', icon: FolderHeart },
  { to: '/feed', label: 'Feed', icon: Rss },
  { to: '/profile', label: 'Profile', icon: User },
];
const GUEST_ITEMS = [
  { to: '/', label: 'Browse', icon: LayoutGrid, end: true },
  { to: '/login', label: 'Login', icon: LogIn },
  { to: '/register', label: 'Register', icon: UserPlus },
];
const ADMIN_ITEMS = [{ to: '/admin', label: 'Admin panel', icon: ShieldCheck }];

function Item({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
          isActive ? 'bg-primary-soft text-primary' : 'text-ink/70 hover:bg-primary-soft/60'
        }`
      }
    >
      <Icon size={20} />
      {item.label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto border-r border-line bg-white p-5 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <ChefHat size={20} />
            </span>
            RecipeBox
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1 hover:bg-primary-soft lg:hidden">
            <X size={20} />
          </button>
        </div>

        <Link
          to="/recipes/new"
          className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white shadow-sm hover:bg-primary-dark"
        >
          <Plus size={18} /> Add a Recipe
        </Link>

        <p className="mb-2 px-3 text-xs text-ink/50">Menu</p>
        <nav className="flex flex-col gap-1">
          {(user ? USER_ITEMS : GUEST_ITEMS).map((i) => <Item key={i.to} item={i} />)}
        </nav>

        {isAdmin && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs text-ink/50">Admin</p>
            <nav className="flex flex-col gap-1">
              {ADMIN_ITEMS.map((i) => <Item key={i.to} item={i} />)}
            </nav>
          </>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-primary-soft/60"
          >
            <LogOut size={20} /> Log out
          </button>
        )}
      </aside>
    </>
  );
}