import { Link } from 'react-router-dom';
import { getInitials, resolveImage } from '../../utils/helpers';

// Round avatar: image if present, otherwise initials. Reused across the app.
export function Avatar({ user, size = 40, className = '' }) {
  const src = resolveImage(user?.avatar);
  const style = { width: size, height: size, fontSize: size * 0.38 };
  return src ? (
    <img src={src} alt={user?.name || 'User'} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span style={style} className={`flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary ${className}`}>
      {getInitials(user?.name)}
    </span>
  );
}

export default function UserCard({ user, onNavigate }) {
  return (
    <Link to={`/users/${user.id}`} onClick={onNavigate} className="flex items-center gap-3 rounded-xl p-2 hover:bg-primary-soft">
      <Avatar user={user} size={44} />
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name}</p>
        {user.bio && <p className="truncate text-sm text-ink/60">{user.bio}</p>}
      </div>
    </Link>
  );
}