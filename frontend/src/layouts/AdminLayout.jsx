import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/recipes', label: 'Recipes' },
  { to: '/admin/categories', label: 'Categories' },
];

export default function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Admin</h1>
      <nav className="mb-6 flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium ${
                isActive ? 'border-primary text-primary' : 'border-transparent text-ink/60 hover:text-ink'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}