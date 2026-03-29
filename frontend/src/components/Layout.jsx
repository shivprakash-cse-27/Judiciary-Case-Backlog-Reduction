import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="md:pl-64 min-h-screen flex flex-col">
        <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
