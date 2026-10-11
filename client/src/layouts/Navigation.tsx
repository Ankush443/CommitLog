import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../components/common/ThemeSwitcher';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/logs', label: 'Logs', icon: '📝' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/recap', label: 'Weekly Recap', icon: '📈' },
];

export default function Navigation() {
  return (
    <nav className="w-64 bg-[rgb(var(--bg-secondary))] border-r border-[rgb(var(--border-color))] h-screen sticky top-0 p-5 flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">CommitLog</h1>
        <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">Daily journal for engineers</p>
      </div>

      <ul className="space-y-1 flex-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-medium'
                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-5 border-t border-[rgb(var(--border-color))] space-y-4">
        <NavLink
          to="/logs/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium"
        >
          <span className="text-xl">+</span>
          <span>New Log</span>
        </NavLink>

        <ThemeSwitcher />
      </div>
    </nav>
  );
}
