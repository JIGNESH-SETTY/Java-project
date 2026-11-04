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
            isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
          } rounded-2xl text-xs font-semibold transition-all duration-200 select-none ${
            isActive
              ? 'bg-[#DFD1B7]/40 dark:bg-[#DFD1B7]/15 text-[#212832] dark:text-[#DFD1B7] shadow-2xs border border-[#DFD1B7] dark:border-[#948878]/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#DFD1B7]/20 dark:hover:bg-slate-800/60 border border-transparent'
          } ${link.highlight && !isActive ? 'text-[#948878] dark:text-[#DFD1B7] font-bold' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive
                  ? 'text-[#212832] dark:text-[#DFD1B7]'
                  : link.highlight
                  ? 'text-[#948878] dark:text-[#DFD1B7]'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
              }`}
            />
            {!isCollapsed && <span className="truncate">{link.label}</span>}

            {/* Hover Tooltip when Dock is Collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {link.label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-3 sm:p-4 overflow-y-auto overflow-x-hidden">
      {/* Top Hub: Logo Brand + Quick Jump + Collapse Button */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-1 px-1">
          <div
            onClick={() => { navigate('/'); onClose?.(); }}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2.5'} cursor-pointer select-none group`}
          >
            <img src="/logo.png" alt="RINNE Logo" className="w-8 h-8 rounded-xl object-contain group-hover:scale-105 transition-transform shadow-xs" />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight leading-none group-hover:text-[#948878] dark:group-hover:text-[#DFD1B7] transition-colors">
                    RINNE
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#DFD1B7]/50 dark:bg-[#393D46] text-[#212832] dark:text-[#DFD1B7] border border-[#DFD1B7] dark:border-[#948878]/30">
                    Engine
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  Discovery & Evidence
                </p>
              </div>
            )}
          </div>

          {/* Desktop Dock Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Spotlight Command Palette Trigger Pill */}
        {!isCollapsed ? (
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-[#212832]/80 hover:bg-white dark:hover:bg-[#2A323E] border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs hover:border-[#948878] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#212832] dark:group-hover:text-[#DFD1B7] transition-colors" />
              <span>Quick Jump / Search...</span>
            </div>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-[#181C22] text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-[#212832] dark:hover:text-[#DFD1B7] hover:bg-white dark:hover:bg-[#212832] transition-colors cursor-pointer"
            title="Open Spotlight Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Navigation Sections */}
        <div className="space-y-4 pt-1">
          {/* WORKSPACE Section */}
          <div>
            {!isCollapsed && (
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 px-2.5 uppercase">
                Workspace
              </span>
            )}
            <nav className="flex flex-col gap-1">
              {workspaceLinks.map(renderNavLink)}
            </nav>
          </div>

          {/* ANALYSIS & EVIDENCE Section */}
          <div>
            {!isCollapsed ? (
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 px-2.5 uppercase">
                Analysis & Graphs
              </span>
            ) : (
              <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/80" />
            )}
            <nav className="flex flex-col gap-1">
              {analysisLinks.map(renderNavLink)}
            </nav>
          </div>

          {/* SYSTEM Section */}
          <div>
            {!isCollapsed ? (
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 px-2.5 uppercase">
                System
              </span>
            ) : (
              <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/80" />
            )}
            <nav className="flex flex-col gap-1">
              {systemLinks.map(renderNavLink)}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Dock: Evidence Taxonomy + User Profile & Theme Bar */}
      <div className="pt-4 space-y-3">
        {/* Provenance Taxonomy Widget */}
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Evidence Taxonomy
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 shrink-0" />
                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Reported in Paper</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shrink-0" />
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI Interpretation</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-500 shrink-0" />
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">User Assertion</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Reported Evidence Grounded" />
            <span className="w-2 h-2 rounded-full bg-blue-500" title="AI Synthesized" />
            <span className="w-2 h-2 rounded-full bg-amber-500" title="User Asserted" />
          </div>
        )}

        {/* User Profile, Theme Switcher & Logout Bar */}
        <div className={`p-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          {!isCollapsed ? (
            <>
              <div
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                title="Open Settings"
              >
                <div className="w-8 h-8 rounded-xl bg-[#DFD1B7]/40 dark:bg-[#393D46] border border-[#DFD1B7] dark:border-[#948878]/30 text-[#212832] dark:text-[#DFD1B7] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#948878] dark:group-hover:text-[#DFD1B7] transition-colors">
                    {user?.displayName || 'Researcher'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 text-[#948878] dark:text-[#DFD1B7]" />
                    <span>{user?.role?.replace('ROLE_', '') || 'USER'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle theme mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
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
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
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
      {/* Desktop Persistent Floating Glass Sidebar / Dock */}
      <aside
        className={`hidden md:flex flex-col shrink-0 my-3 ml-4 sm:ml-6 mb-4 rounded-3xl glass-sidebar border border-slate-200/80 dark:border-white/10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-[74px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 glass-sidebar z-10 h-full shadow-2xl flex flex-col bg-white dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
