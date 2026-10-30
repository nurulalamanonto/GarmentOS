import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function Navbar() {
  const { toggleSidebar, theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
          title="Show or hide the menu"
        >
          <Menu size={22} />
        </button>
        <p className="hidden text-sm text-slate-500 sm:block">Garment Manufacturing &amp; Export Management</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-800 text-sm font-semibold text-white">
            MG
          </span>
          <div className="hidden text-sm leading-tight sm:block">
            <p className="font-medium text-slate-800">Merchandising Manager</p>
            <p className="text-xs text-slate-500">Dhaka Apparel Ltd.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
