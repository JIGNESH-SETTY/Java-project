import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Scale,
  GitCommit,
  GitBranch,
  Network,
  FileSpreadsheet,
  FolderKanban,
  Settings,
  UploadCloud,
  HelpCircle,
  X,
  FileCheck,
  Sparkles,
  User,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_dock_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_dock_collapsed', String(next));
      return next;
    });
  };

  const workspaceLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Paper Library', icon: BookOpen },
    { to: '/import', label: 'Import Paper', icon: UploadCloud, highlight: true },
    { to: '/search', label: 'Semantic Search', icon: Search },
  ];

  const analysisLinks = [
    { to: '/compare', label: 'Compare Papers', icon: Scale },
    { to: '/claims', label: 'Claims & Evidence', icon: GitCommit },
    { to: '/graph/citations', label: 'Citation Graph', icon: GitBranch },
    { to: '/graph/concepts', label: 'Concept Graph', icon: Network },
    { to: '/reviews', label: 'Literature Reviews', icon: FileSpreadsheet },
  ];

  const systemLinks = [
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/settings', label: 'Settings & Status', icon: Settings },
  ];

  const renderNavLink = (link: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={onClose}
        title={isCollapsed ? link.label : undefined}
        className={({ isActive }) =>
          `group relative flex items-center ${
            isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
          } rounded-[9px] text-[13px] font-medium transition-all duration-150 select-none ${
            isActive
              ? 'bg-[#DCEBEE] dark:bg-[#1B4A59] text-[#0F4C5C] dark:text-[#E0F2F6] font-bold shadow-2xs'
              : 'text-[#334155] dark:text-[#C4DDE5] hover:text-[#0B2A33] dark:hover:text-white hover:bg-[#E6EDF3] dark:hover:bg-[#1A3E4E]'
          } ${link.highlight && !isActive ? 'text-[#0F4C5C] dark:text-[#38BDF8] font-semibold' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                isActive
                  ? 'text-[#0F4C5C] dark:text-[#E0F2F6]'
                  : link.highlight
                  ? 'text-[#0F4C5C] dark:text-[#38BDF8]'
                  : 'text-[#5B6B7D] dark:text-[#8EB3C2] group-hover:text-[#0B2A33] dark:group-hover:text-white'
              }`}
            />
            {!isCollapsed && <span className="truncate">{link.label}</span>}

            {/* Hover Tooltip when Dock is Collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-[#0B2A33] text-white text-[11px] font-semibold whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {link.label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden">
      {/* Top Hub: Logo Brand + Quick Jump + Collapse Button */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-1 px-1">
          <div
            onClick={() => { navigate('/'); onClose?.(); }}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'} cursor-pointer select-none group`}
          >
            <img
              src="/logo.png"
              alt="RINNE Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center">
                  <span className="font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] text-sm tracking-wide leading-none group-hover:text-[#0F4C5C] dark:group-hover:text-[#38BDF8] transition-colors">
                    RINNE
                  </span>
                  <span className="tag-engine">
                    ENGINE
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] font-medium truncate mt-0.5">
                  Discovery &amp; Evidence
                </p>
              </div>
            )}
          </div>

          {/* Desktop Dock Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#0B2A33] dark:hover:text-white hover:bg-[#E6EDF3] dark:hover:bg-[#1A3E4E] transition-colors cursor-pointer"
              title="Collapse to Dock"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center pb-1">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#0B2A33] dark:hover:text-white hover:bg-[#E6EDF3] dark:hover:bg-[#1A3E4E] transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Jump Search Box (Claude Style) */}
        {!isCollapsed ? (
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[12.5px] font-medium text-[#6B7785] dark:text-[#8EB3C2] bg-white dark:bg-[#122B36] hover:bg-[#F1F5F9] dark:hover:bg-[#163442] border border-[#C3CED9] dark:border-[#2A5A6E] shadow-2xs hover:border-[#0F4C5C] dark:hover:border-[#38BDF8] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#5B6B7D] group-hover:text-[#0F4C5C] dark:group-hover:text-[#38BDF8] transition-colors" />
              <span>Quick Jump / Search…</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 select-none">
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] border border-[#D9E1E9] dark:border-[#1E4656] text-[#5B6B7D] dark:text-[#8EB3C2] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono font-bold shadow-2xs leading-none">
                ⌘
              </kbd>
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] border border-[#D9E1E9] dark:border-[#1E4656] text-[#5B6B7D] dark:text-[#8EB3C2] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono font-bold shadow-2xs leading-none">
                K
              </kbd>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex justify-center p-2 rounded-lg text-[#5B6B7D] hover:text-[#0F4C5C] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-[#122B36] transition-colors cursor-pointer"
            title="Open Spotlight Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Navigation Sections */}
        <div className="space-y-3 pt-0.5">
          {/* WORKSPACE Section */}
          <div>
            {!isCollapsed && (
              <span className="block text-[10.5px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] mb-1 px-2.5 uppercase">
                Workspace
              </span>
            )}
            <nav className="flex flex-col gap-0.5">
              {workspaceLinks.map(renderNavLink)}
            </nav>
          </div>

          {/* ANALYSIS & EVIDENCE Section */}
          <div>
            {!isCollapsed ? (
              <span className="block text-[10.5px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] mb-1 px-2.5 uppercase">
                Analysis &amp; Graphs
              </span>
            ) : (
              <div className="my-2 border-t border-[#D9E1E9] dark:border-[#1E4656]" />
            )}
            <nav className="flex flex-col gap-0.5">
              {analysisLinks.map(renderNavLink)}
            </nav>
          </div>

          {/* SYSTEM Section */}
          <div>
            {!isCollapsed ? (
              <span className="block text-[10.5px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] mb-1 px-2.5 uppercase">
                System
              </span>
            ) : (
              <div className="my-2 border-t border-[#D9E1E9] dark:border-[#1E4656]" />
            )}
            <nav className="flex flex-col gap-0.5">
              {systemLinks.map(renderNavLink)}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Dock: Evidence Taxonomy + User Profile & Theme Bar */}
      <div className="pt-3 space-y-2.5">
        {/* Provenance Taxonomy Widget */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-[12px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs text-xs space-y-2">
            <div className="font-bold text-[#0B2A33] dark:text-[#E0F2F6] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#5B6B7D] dark:text-[#8EB3C2] font-bold">
                Evidence Taxonomy
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-[#5B6B7D]" />
            </div>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex items-center gap-2 text-[#1B6B43] dark:text-[#34D399] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#1B6B43] shrink-0" />
                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Reported in Paper</span>
              </div>
              <div className="flex items-center gap-2 text-[#4F46B8] dark:text-[#818CF8] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#4F46B8] shrink-0" />
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI Interpretation</span>
              </div>
              <div className="flex items-center gap-2 text-[#7A5C0E] dark:text-[#FBBF24] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#7A5C0E] shrink-0" />
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">User Assertion</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 border-t border-[#D9E1E9] dark:border-[#1E4656]">
            <span className="w-2 h-2 rounded-full bg-[#1B6B43]" title="Reported in Paper" />
            <span className="w-2 h-2 rounded-full bg-[#4F46B8]" title="AI Interpretation" />
            <span className="w-2 h-2 rounded-full bg-[#7A5C0E]" title="User Assertion" />
          </div>
        )}

        {/* User Profile, Theme Switcher & Logout Bar */}
        <div className={`p-2 rounded-[12px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          {!isCollapsed ? (
            <>
              <div
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 min-w-0 cursor-pointer group"
                title="Open Settings"
              >
                <div className="w-7 h-7 rounded-[8px] bg-[#DCEBEE] dark:bg-[#1B4A59] border border-[#B7D9E2] dark:border-[#2A5A6E] text-[#0F4C5C] dark:text-[#E0F2F6] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6] truncate group-hover:text-[#0F4C5C] dark:group-hover:text-[#38BDF8] transition-colors">
                    {user?.displayName || 'Researcher'}
                  </div>
                  <div className="text-[10px] text-[#5B6B7D] dark:text-[#8EB3C2] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 text-[#0F4C5C] dark:text-[#38BDF8]" />
                    <span>{user?.role?.replace('ROLE_', '') || 'USER'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#0B2A33] dark:text-[#8EB3C2] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#163442] transition cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#0B2A33]" />
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#B3261E] hover:bg-[#FBE7E4] dark:hover:bg-red-950/30 transition cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#0B2A33] dark:text-[#8EB3C2] dark:hover:text-white hover:bg-white dark:hover:bg-[#163442] transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0B2A33]" />
                )}
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#5B6B7D] hover:text-[#B3261E] hover:bg-[#FBE7E4] transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Floating Sidebar (14px Radius) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 my-3 ml-4 sm:ml-6 mb-4 rounded-[14px] glass-sidebar border border-[#D9E1E9] dark:border-[#1E4656] shadow-[0_4px_20px_-5px_rgba(11,42,51,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-[72px]' : 'w-[276px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B2A33]/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 glass-sidebar z-10 h-full shadow-2xl flex flex-col bg-[#EEF2F6] dark:bg-[#0D222B]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
