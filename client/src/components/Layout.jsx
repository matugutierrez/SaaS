import { Outlet } from 'react-router-dom';
import { ToastProvider } from './common/Toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-page">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden max-md:pl-[68px]">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
