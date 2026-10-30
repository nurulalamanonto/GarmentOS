import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Shared UI state that many components need:
//  - the colour theme (light / dark)
//  - the sidebar: a slide-in drawer on phones/tablets, a collapsible column on desktop
//  - the list of on-screen notifications (toasts)
const AppContext = createContext(null);

const NOTIFICATION_DURATION_MS = 5000;
const DESKTOP_QUERY = '(min-width: 1024px)'; // same breakpoint as Tailwind's `lg`
let nextNotificationId = 1;

// Reads the saved theme, or falls back to the computer's light/dark setting.
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('garmentos-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage can be blocked; ignore and use the system setting
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // desktop column
  const [notifications, setNotifications] = useState([]);

  // Put the theme on <html data-theme="..."> so the CSS in index.css can react to it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('garmentos-theme', theme);
    } catch {
      // not saving is fine
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  // The 3-line menu button: collapses the sidebar on desktop, opens the drawer on small screens.
  const toggleSidebar = useCallback(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setIsSidebarCollapsed((current) => !current);
    } else {
      setIsSidebarOpen((current) => !current);
    }
  }, []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const dismissNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  // type: 'success' | 'error' | 'info' | 'warning'
  const notify = useCallback(
    (type, message) => {
      const id = nextNotificationId++;
      setNotifications((current) => [...current, { id, type, message }]);
      setTimeout(() => dismissNotification(id), NOTIFICATION_DURATION_MS);
    },
    [dismissNotification],
  );

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      isSidebarOpen,
      isSidebarCollapsed,
      toggleSidebar,
      closeSidebar,
      notifications,
      notify,
      dismissNotification,
    }),
    [theme, toggleTheme, isSidebarOpen, isSidebarCollapsed, toggleSidebar, closeSidebar, notifications, notify, dismissNotification],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return context;
};
