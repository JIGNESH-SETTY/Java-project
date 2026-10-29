import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { Cpu, Database, Terminal, Shield, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & AI Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configuration, infrastructure observability, and pluggable AI providers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pluggable AI Engine Card */}
        <GlassPanel className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pluggable AI Inference</h3>
                <p className="text-[11px] text-slate-500">Embeddings & Structured Aspects</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Multi-Model Ready
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-white/70 p-3.5 rounded-xl border border-slate-200/80 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Supported Providers:</span>
              <span className="text-indigo-700 font-semibold">Gemini · OpenAI · Claude · Ollama · Mock</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vector Embeddings:</span>
              <span className="text-slate-800">384-dimensional cosine space</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Structured Parsing:</span>
              <span className="text-emerald-700 font-semibold">Strict JSON Schema Enforcement</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            The platform supports local open-source LLMs via Ollama, production cloud models (Google Gemini, OpenAI, Anthropic Claude), and an offline deterministic simulation engine.
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

      {/* AI Configuration Options Box */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Configuring AI Providers in .env</span>
        </div>
        <p className="text-xs text-slate-600">
          Switch models by setting <code className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px]">AI_PROVIDER</code> in your <code className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px]">.env</code> file:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1.5">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 1: Google Gemini (Free / Fast)
            </div>
            <div className="text-slate-400 text-[11px]">AI_PROVIDER=GEMINI</div>
            <div className="text-emerald-400 text-[11px]">GEMINI_API_KEY=AIzaSy...</div>
            <div className="text-slate-400 text-[10px]"># Models: gemini-1.5-flash & text-embedding-004</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1.5">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 2: OpenAI
            </div>
            <div className="text-slate-400 text-[11px]">AI_PROVIDER=OPENAI</div>
            <div className="text-emerald-400 text-[11px]">OPENAI_API_KEY=sk-...</div>
            <div className="text-slate-400 text-[10px]"># Models: gpt-4o-mini & text-embedding-3-small</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1.5">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 3: Anthropic Claude
            </div>
            <div className="text-slate-400 text-[11px]">AI_PROVIDER=ANTHROPIC</div>
            <div className="text-emerald-400 text-[11px]">ANTHROPIC_API_KEY=sk-ant-...</div>
            <div className="text-slate-400 text-[10px]"># Models: claude-3-5-haiku-20241022</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 space-y-1.5">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 4: Local Ollama
            </div>
            <div className="text-slate-400 text-[11px]">AI_PROVIDER=OLLAMA</div>
            <div className="text-emerald-400 text-[11px]">APP_AI_OLLAMA_CHAT_MODEL=llama3:latest</div>
            <div className="text-slate-400 text-[10px]"># ollama pull nomic-embed-text</div>
          </div>
        </div>
      </GlassPanelStrong>

      {/* User Information */}
      <GlassPanel className="p-6 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Active Session Information</span>
        </div>
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
