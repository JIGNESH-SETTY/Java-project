import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Cpu, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1322]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-sm tracking-wide">AI Research Discovery</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Evidence Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Strict Non-Hallucinatory Scholarly Synthesis</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mock/Ollama AI Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Local Engine Active</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
            Offline Safe
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200">{user?.displayName || 'Student Researcher'}</div>
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              {user?.role?.replace('ROLE_', '') || 'USER'}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <User className="w-4 h-4" />
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
