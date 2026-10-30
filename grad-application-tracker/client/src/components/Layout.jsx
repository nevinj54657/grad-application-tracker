import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/saved-jobs', label: 'Saved Jobs' },
  { to: '/interviews', label: 'Interviews' },
  { to: '/settings', label: 'Settings' },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <span className="text-lg font-bold text-slate-900">Application Tracker</span>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          Menu
        </button>
      </header>

      {menuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <span className="mb-6 px-2 text-lg font-bold text-slate-900">Application Tracker</span>
        <NavLinks />
        <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
          {user && <p className="truncate px-2 text-xs text-slate-500">Signed in as {user.name}</p>}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
