import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Database, ShieldCheck, Terminal, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Engine Status</h1>
        <p className="text-xs text-slate-400">
          Environment configuration, AI model provider diagnostics, and B.Tech demonstration guidelines
        </p>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* AI Provider Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">AI Model Provider</h3>
                <p className="text-[11px] text-slate-400">Embeddings & Structured Aspects</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active & Healthy
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Mode:</span>
              <span className="text-indigo-300">Mock AI Engine (Offline Safe)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Embedding Model:</span>
              <span className="text-slate-200">all-MiniLM-L6-v2 (384-d normalized)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ollama Fallback:</span>
              <span className="text-emerald-400">Auto-Fallback Enabled</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The project includes a built-in deterministic academic AI provider, guaranteeing 100% functionality without requiring GBs of external model downloads.
          </p>
        </div>

        {/* Database & Vector Store Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Persistence & Vectors</h3>
                <p className="text-[11px] text-slate-400">PostgreSQL 16 + pgvector / Spring JDBC</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              JdbcTemplate Only
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Architecture:</span>
              <span className="text-slate-200">Zero Hibernate / Pure Spring JDBC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vector Indexing:</span>
              <span className="text-indigo-300">HNSW Cosine Distance (&lt;=&gt;)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lexical Indexing:</span>
              <span className="text-slate-200">PostgreSQL Full-Text tsvector</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            All queries utilize parameterized SQL and explicit row mappers, strictly avoiding ORM overhead and JPA caching ambiguities.
          </p>
        </div>
      </div>

      {/* Ollama Local Setup Terminal Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Optional: Local Ollama Model Setup</span>
        </div>
        <p className="text-xs text-slate-400">
          To switch from the offline Mock engine to local Ollama inference, run the following commands in your host terminal:
        </p>

        <div className="bg-[#070b14] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500"># 1. Pull lightweight embedding and chat models:</div>
          <div className="text-emerald-400">ollama pull nomic-embed-text</div>
          <div className="text-emerald-400">ollama pull llama3.2</div>
          <div className="text-slate-500 pt-1"># 2. In backend application.yml or .env, set:</div>
          <div className="text-indigo-300">AI_PROVIDER=OLLAMA</div>
          <div className="text-indigo-300">OLLAMA_BASE_URL=http://localhost:11434</div>
        </div>
      </div>

      {/* User Information */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
        <h3 className="font-semibold text-slate-200 text-sm">Active Session Information</h3>
        <div className="space-y-1.5 text-slate-300">
          <div>Display Name: <strong>{user?.displayName}</strong></div>
          <div>Email: <strong>{user?.email}</strong></div>
          <div>Role: <strong>{user?.role}</strong></div>
          <div>User ID: <span className="font-mono text-slate-400">{user?.id}</span></div>
        </div>
      </div>
    </div>
  );
};
