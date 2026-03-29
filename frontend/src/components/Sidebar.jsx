import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineScale,
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlinePlusCircle,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, roles: ['Admin', 'Judge', 'CourtStaff', 'Lawyer'] },
    { path: '/cases', label: 'Cases', icon: HiOutlineFolder, roles: ['Admin', 'Judge', 'CourtStaff', 'Lawyer'] },
    { path: '/cases/add', label: 'File New Case', icon: HiOutlinePlusCircle, roles: ['Admin', 'CourtStaff', 'Lawyer'] },
    { path: '/hearings', label: 'Hearings', icon: HiOutlineCalendar, roles: ['Admin', 'Judge', 'CourtStaff'] },
    { path: '/profile', label: 'Profile', icon: HiOutlineUser, roles: ['Admin', 'Judge', 'CourtStaff', 'Lawyer'] },
    {
  path: 'https://quick-ai-40o7.onrender.com/',
  label: 'Ai Chat',
  icon: HiOutlineUser,
  roles: ['Admin', 'Judge', 'CourtStaff', 'Lawyer'],
  external: true // ✅ ADD THIS
}
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500/20 text-purple-300';
      case 'Judge': return 'bg-amber-500/20 text-amber-300';
      case 'CourtStaff': return 'bg-blue-500/20 text-blue-300';
      case 'Lawyer': return 'bg-emerald-500/20 text-emerald-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-md"
      >
        {collapsed ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Overlay */}
      {collapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40
        w-64 bg-slate-900/95 backdrop-blur-xl
        border-r border-slate-700/50
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${collapsed ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <HiOutlineScale className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Smart Judiciary</h1>
              <p className="text-xs text-slate-400">Case Management</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mx-3 mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getRoleBadgeColor(user?.role)}`}>
                {user?.role === 'CourtStaff' ? 'Court Staff' : user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setCollapsed(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;