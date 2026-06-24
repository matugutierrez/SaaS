import { Outlet } from 'react-router-dom';
import { ToastProvider } from './common/Toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 dark:text-gray-100">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
