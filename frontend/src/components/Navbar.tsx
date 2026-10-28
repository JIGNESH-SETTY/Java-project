import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  User,
  Cpu,
  ShieldCheck,
  Search,
  UploadCloud,
  Bell,
  Menu,
} from 'lucide-react';
import { GlassButton } from './GlassButton';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGlobalSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <header className="h-16 glass-navbar px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">AI Research Engine</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Evidence First
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Non-Hallucinatory Scholarly Synthesis</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search papers, claims, or press Enter..."
            onKeyDown={handleGlobalSearchKeyDown}
            className="glass-input w-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white/60 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Import Paper Shortcut */}
        <GlassButton
          size="sm"
          variant="primary"
          icon={<UploadCloud className="w-3.5 h-3.5" />}
          onClick={() => navigate('/import')}
          className="hidden sm:inline-flex"
        >
          Import Paper
        </GlassButton>

        {/* Engine Status */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-xs text-slate-700 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="font-medium">Offline Mock Engine</span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
            Zero Hallucination
          </span>
        </div>

        {/* Notifications Placeholder */}
        <button
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 transition relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">{user?.displayName || 'Student Researcher'}</div>
            <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              {user?.role?.replace('ROLE_', '') || 'USER'}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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
