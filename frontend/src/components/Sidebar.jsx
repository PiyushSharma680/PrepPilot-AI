import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Video,
  FileText,
  Code2,
  BookOpen,
  Map,
  Notebook,
  Building2,
  LogOut,
  Zap,
  Flame
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',        path: '/',             icon: LayoutDashboard },
  { name: 'Mock Interview',   path: '/interview',    icon: Video },
  { name: 'Resume Analyzer',  path: '/resume',       icon: FileText },
  { name: 'DSA Tracker',      path: '/dsa',          icon: Code2 },
  { name: 'Study Roadmaps',   path: '/roadmaps',     icon: Map },
  { name: 'CS Fundamentals',  path: '/fundamentals', icon: BookOpen },
  { name: 'Company Prep',     path: '/company-prep', icon: Building2 },
  { name: 'Notes & Mentor',   path: '/notes',        icon: Notebook },
];

const Sidebar = ({ open = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login');
  };

  // Generate initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Brand */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-none">PrepPilot AI</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Placement Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User panel */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-800 truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
            {/* Streak badge */}
            {(user.dsaStreak || 0) > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 shrink-0">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{user.dsaStreak}</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="nav-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
