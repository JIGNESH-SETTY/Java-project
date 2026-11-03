import React from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogOut,
  User,
  ShieldCheck,
  Search,
  UploadCloud,
  Menu,
  Sun,
  Moon,
  Command,
  LayoutDashboard,
  BookOpen,
  Scale,
  GitCommit,
  GitBranch,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/compare', label: 'Compare', icon: Scale },
    { to: '/claims', label: 'Claims', icon: GitCommit },
    { to: '/graph/citations', label: 'Graphs', icon: GitBranch, activeMatch: '/graph' },
    { to: '/reviews', label: 'Reviews', icon: FileSpreadsheet },
  ];

  return (
    <header className="mx-3 sm:mx-6 mt-3.5 mb-2.5 rounded-2xl sm:rounded-3xl glass-navbar px-3.5 sm:px-6 h-16 flex items-center justify-between z-40 relative select-none">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Photorealistic 3D Cobalt Prism Lens Emblem */}
          <div className="sense-orb-icon w-9 h-9 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                AI Research Engine
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                Evidence First
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block font-medium truncate">
              Non-Hallucinatory Scholarly Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Center Floating Workspace Pills (Desktop Large Screens) */}
      <nav className="hidden 2xl:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeMatch
            ? location.pathname.startsWith(item.activeMatch)
            : location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200/80 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Center/Right Omnibar Command Trigger (Tablet & Desktop) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-xs hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all cursor-pointer group"
          title="Open Spotlight Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          <span className="hidden sm:inline font-medium">Quick Jump / Search...</span>
          <span className="sm:hidden font-medium">Search...</span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>

        {/* Import Paper Action Button */}
        <button
          onClick={() => navigate('/import')}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Import Paper</span>
        </button>

        {/* Theme Mode Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
          <div className="text-right hidden xl:block">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.displayName || 'Student Researcher'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{user?.role?.replace('ROLE_', '') || 'USER'}</span>
            </div>
          </div>
          <div
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer hover:scale-105 transition-transform"
            title="Profile & AI Settings"
          >
            <User className="w-4 h-4" />
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center justify-center cursor-pointer"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
