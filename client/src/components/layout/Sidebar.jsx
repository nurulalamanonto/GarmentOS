import { NavLink } from 'react-router-dom';
import { AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignJustify, AlignVerticalJustifyCenter, Shirt, X } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation.js';
import { useApp } from '../../context/AppContext.jsx';

// The sidebar keeps the same navy colours in light and dark theme, so its text uses
// fixed colours (the grey scale used elsewhere is flipped in dark mode).
export default function Sidebar() {
  const { isSidebarOpen, isSidebarCollapsed, closeSidebar } = useApp();

  return (
    <>
      {/* Dark overlay behind the drawer on small screens */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-[#c5d0e0] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'lg:hidden' : ''}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-500 text-white">
              <Shirt size={20} aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">GarmentOS</span>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded p-1 text-[#c5d0e0] hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-teal-500/15 text-teal-300' : 'text-[#c5d0e0] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-[#8fa0b8]">
          Demo factory: Dhaka Apparel Ltd.
        </div>
      </aside>
    </>
  );
}
