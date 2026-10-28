import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Database, ShieldCheck, Terminal, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Engine Status</h1>
        <p className="text-xs text-slate-500">
          Environment configuration, AI model provider diagnostics, and production deployment guidelines
        </p>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* AI Provider Status Card */}
        <GlassPanel className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI Model Provider</h3>
                <p className="text-[11px] text-slate-500">Embeddings & Structured Aspects</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active & Healthy
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-white/70 p-3.5 rounded-xl border border-slate-200/80 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Mode:</span>
              <span className="text-indigo-700 font-semibold">Mock AI Engine (Offline Safe)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Embedding Model:</span>
              <span className="text-slate-800">all-MiniLM-L6-v2 (384-d normalized)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ollama Fallback:</span>
              <span className="text-emerald-700 font-semibold">Auto-Fallback Enabled</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            The project includes a built-in deterministic academic AI provider, guaranteeing 100% functionality without requiring gigabytes of external model downloads.
          </p>
        </GlassPanel>

        {/* Database & Vector Store Card */}
        <GlassPanel className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Persistence & Vectors</h3>
                <p className="text-[11px] text-slate-500">PostgreSQL 16 + pgvector / Spring JDBC</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              JdbcTemplate Only
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-white/70 p-3.5 rounded-xl border border-slate-200/80 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Architecture:</span>
              <span className="text-slate-800">Zero Hibernate / Pure Spring JDBC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vector Indexing:</span>
              <span className="text-indigo-700 font-semibold">HNSW Cosine Distance (&lt;=&gt;)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lexical Indexing:</span>
              <span className="text-slate-800">PostgreSQL Full-Text tsvector</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            All queries utilize parameterized SQL and explicit row mappers, strictly avoiding ORM overhead and JPA caching ambiguities.
          </p>
        </GlassPanel>
      </div>

      {/* Ollama Local Setup Terminal Box */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Production & Self-Hosted AI Options</span>
        </div>
        <p className="text-xs text-slate-600">
          To switch from the offline Mock engine to local Ollama or hosted OpenAI-compatible inference, configure your environment variables:
        </p>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 space-y-2 shadow-inner">
          <div className="text-slate-400"># 1. Pull lightweight embedding and chat models locally:</div>
          <div className="text-emerald-400">ollama pull nomic-embed-text</div>
          <div className="text-emerald-400">ollama pull llama3.2</div>
          <div className="text-slate-400 pt-1"># 2. In backend application.yml or .env, set:</div>
          <div className="text-indigo-300">AI_PROVIDER=OLLAMA # or OPENAI_COMPATIBLE</div>
          <div className="text-indigo-300">OLLAMA_BASE_URL=http://localhost:11434</div>
        </div>
      </GlassPanelStrong>

      {/* User Information */}
      <GlassPanel className="p-6 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Active Session Information</h3>
        <div className="space-y-1.5 text-slate-700">
          <div>Display Name: <strong>{user?.displayName}</strong></div>
          <div>Email: <strong>{user?.email}</strong></div>
          <div>Role: <strong>{user?.role}</strong></div>
          <div>User ID: <span className="font-mono text-slate-500">{user?.id}</span></div>
        </div>
      </GlassPanel>
    </div>
  );
};
