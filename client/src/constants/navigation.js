import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Boxes,
  ShieldCheck,
  Ship,
  BarChart3,
  AlertTriangle,
  Settings,
} from 'lucide-react';

// Single source of truth for the sidebar and the router.
// The Sidebar renders this list with .map().
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Orders & Merchandising', path: '/orders', icon: ClipboardList },
  { label: 'Production Management', path: '/production', icon: Factory },
  { label: 'Inventory & Materials', path: '/inventory', icon: Boxes },
  { label: 'Quality Control', path: '/quality', icon: ShieldCheck },
  { label: 'Shipment & Export', path: '/shipments', icon: Ship },
  { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { label: 'Delay Risk Analysis', path: '/risks', icon: AlertTriangle },
  { label: 'Settings', path: '/settings', icon: Settings },
];
