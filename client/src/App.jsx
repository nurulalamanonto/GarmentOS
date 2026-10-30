import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductionPage from './pages/ProductionPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import QualityPage from './pages/QualityPage.jsx';
import ShipmentsPage from './pages/ShipmentsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import RisksPage from './pages/RisksPage.jsx';
import ModulePlaceholderPage from './pages/ModulePlaceholderPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import DesignSystemPage from './pages/DesignSystemPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        {/* Orders & Merchandising is the next stage to be built */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="quality" element={<QualityPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="risks" element={<RisksPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="design-system" element={<DesignSystemPage />} />
        <Route path="*" element={<ModulePlaceholderPage title="Page not found" stage="" />} />
      </Route>
    </Routes>
  );
}
