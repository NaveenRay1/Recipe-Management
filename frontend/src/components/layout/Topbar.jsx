import { Bell, ChevronDown, LogOut, Menu, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import SearchBar from '../common/SearchBar';
import { Avatar } from '../social/UserCard';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const onBrowse = pathname === '/';
  const urlQ = onBrowse ? params.get('q') || '' : '';

  const [text, setText] = useState(urlQ);
  const debounced = useDebounce(text, 400);
  const lastPushed = useRef(urlQ); // lets us tell our own URL updates from external ones (e.g. "clear all")
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // URL changed from elsewhere -> mirror it in the input
  useEffect(() => {
    if (urlQ !== lastPushed.current) {
      lastPushed.current = urlQ;
      setText(urlQ);
    }
  }, [urlQ]);

  // Debounced typing -> ?q
  useEffect(() => {
    const q = debounced.trim();
    if (q === urlQ) return;
    lastPushed.current = q;
    if (onBrowse) {
      const next = new URLSearchParams(params);
      if (q) next.set('q', q);
      else next.delete('q');
      next.delete('page');
      setParams(next, { replace: true });
    } else if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the avatar dropdown on outside click
  useEffect(() => {
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-8">
      <button onClick={onMenuClick} aria-label="Open menu" className="rounded-lg p-2 hover:bg-primary-soft lg:hidden">
        <Menu size={22} />
      </button>

      <SearchBar value={text} onChange={setText} placeholder="What would you like to cook?" className="max-w-md flex-1" />

      <div className="ml-auto flex items-center gap-2">
        {/* Visual only: the API has no notifications endpoint */}
        <button aria-label="Notifications" className="rounded-lg p-2 text-ink/60 hover:bg-primary-soft">
          <Bell size={20} />
        </button>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-1 rounded-xl p-1 hover:bg-primary-soft" aria-haspopup="menu" aria-expanded={menuOpen}>
              <Avatar user={user} size={36} />
              <ChevronDown size={16} className="text-ink/60" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-line bg-white p-1 shadow-lg">
                <p className="truncate px-3 py-2 text-sm font-medium">{user.name}</p>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-soft">
                  <User size={16} /> Profile
                </Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-soft">
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}