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
    <header className="h-18 glass-navbar px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full text-[#615E65] hover:text-[#29282B] hover:bg-white/80 transition md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Photorealistic 3D Glossy Sphere Emblem */}
          <div className="sense-orb-icon w-9 h-9 group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#29282B] text-sm tracking-tight">AI Research Engine</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFEAE6] text-[#E24354] border border-[#FFD5CE]">
                Evidence First
              </span>
            </div>
            <p className="text-[11px] text-[#77747A] hidden sm:block font-medium">Non-Hallucinatory Scholarly Synthesis</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar (Pill shaped with soft shadow) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#8E8B92] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search papers, claims, or press Enter..."
            onKeyDown={handleGlobalSearchKeyDown}
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs text-[#29282B] placeholder:text-[#8E8B92] bg-white/80 border border-white/95 shadow-[0_4px_16px_rgba(41,40,43,0.03)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
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

        {/* Engine Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-white/90 text-xs text-[#29282B] shadow-[0_2px_8px_rgba(41,40,43,0.03)]">
          <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="font-medium text-xs">Offline Mock Engine</span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
            Zero Hallucination
          </span>
        </div>

        {/* Notifications Pill Button */}
        <button
          className="w-10 h-10 rounded-full bg-white/80 border border-white/95 shadow-[0_4px_14px_rgba(41,40,43,0.03)] text-[#4A474D] hover:bg-white hover:scale-105 active:scale-95 transition flex items-center justify-center relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#FF6F61] absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200/60">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[#29282B]">{user?.displayName || 'Student Researcher'}</div>
            <div className="text-[10px] text-[#77747A] flex items-center justify-end gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-[#FF6F61]" />
              {user?.role?.replace('ROLE_', '') || 'USER'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/85 border border-white/95 shadow-[0_4px_14px_rgba(41,40,43,0.03)] flex items-center justify-center text-[#4A474D] font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full text-[#8E8B92] hover:text-red-600 hover:bg-red-50/80 transition flex items-center justify-center"
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
