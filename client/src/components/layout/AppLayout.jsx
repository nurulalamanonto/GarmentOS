import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import NotificationStack from '../ui/NotificationStack.jsx';

// The frame around every page: sidebar on the left, navbar on top, page in <main>.
export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
      <NotificationStack />
    </div>
  );
}
