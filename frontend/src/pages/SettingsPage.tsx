import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { Cpu, Database, Terminal, Shield, Sparkles, Sun, Moon, Laptop } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">System & AI Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Appearance preferences, configuration, infrastructure observability, and pluggable AI providers
        </p>
      </div>

      {/* Theme Preference Card */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Interface Appearance</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Switch between Light Precision and Deep Dark Obsidian themes</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
            Active: {theme} mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'light'
                ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Light Academic Mode</span>
                {theme === 'light' && <span className="text-[10px] font-semibold text-blue-600">● Selected</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Clean academic titanium aesthetic with high contrast and optimal daylight readability.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 text-blue-100 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Dark Obsidian Mode</span>
                {theme === 'dark' && <span className="text-[10px] font-semibold text-blue-400">● Selected</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Deep obsidian and sapphire palette engineered for focused night sessions and low eye fatigue.
              </p>
            </div>
          </button>
        </div>
      </GlassPanelStrong>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pluggable AI Engine Card */}
        <GlassPanel className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pluggable AI Inference</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Embeddings & Structured Aspects</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Multi-Model Ready
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Supported Providers:</span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold">Gemini · OpenAI · Claude · Ollama · Mock</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Vector Embeddings:</span>
              <span className="text-slate-800 dark:text-slate-200">384-dimensional cosine space</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Structured Parsing:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Strict JSON Schema Enforcement</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            The platform supports local open-source LLMs via Ollama, production cloud models (Google Gemini, OpenAI, Anthropic Claude), and an offline deterministic simulation engine.
          </p>
        </GlassPanel>

        {/* Database & Vector Store Card */}
        <GlassPanel className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Persistence & Vectors</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">PostgreSQL 16 + pgvector / Spring JDBC</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              JdbcTemplate Only
            </span>
          </div>

          <div className="space-y-2 text-[11px] bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Architecture:</span>
              <span className="text-slate-800 dark:text-slate-200">Zero Hibernate / Pure Spring JDBC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Vector Indexing:</span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold">HNSW Cosine Distance (&lt;=&gt;)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Lexical Indexing:</span>
              <span className="text-slate-800 dark:text-slate-200">PostgreSQL Full-Text tsvector</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            All queries utilize parameterized SQL and explicit row mappers, strictly avoiding ORM overhead and JPA caching ambiguities.
          </p>
        </GlassPanel>
      </div>

      {/* AI Configuration Options Box */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
          <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Configuring AI Providers in .env</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Switch models by setting <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[11px]">AI_PROVIDER</code> in your <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[11px]">.env</code> file:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1.5">
            <div className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 1: Google Gemini (Free / Fast)
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px]">AI_PROVIDER=GEMINI</div>
            <div className="text-emerald-700 dark:text-emerald-400 text-[11px]">GEMINI_API_KEY=AIzaSy...</div>
            <div className="text-slate-500 text-[10px]"># Models: gemini-1.5-flash & text-embedding-004</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1.5">
            <div className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 2: OpenAI
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px]">AI_PROVIDER=OPENAI</div>
            <div className="text-emerald-700 dark:text-emerald-400 text-[11px]">OPENAI_API_KEY=sk-...</div>
            <div className="text-slate-500 text-[10px]"># Models: gpt-4o-mini & text-embedding-3-small</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1.5">
            <div className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 3: Anthropic Claude
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px]">AI_PROVIDER=ANTHROPIC</div>
            <div className="text-emerald-700 dark:text-emerald-400 text-[11px]">ANTHROPIC_API_KEY=sk-ant-...</div>
            <div className="text-slate-500 text-[10px]"># Models: claude-3-5-haiku-20241022</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1.5">
            <div className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Option 4: Local Ollama
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px]">AI_PROVIDER=OLLAMA</div>
            <div className="text-emerald-700 dark:text-emerald-400 text-[11px]">APP_AI_OLLAMA_CHAT_MODEL=llama3:latest</div>
            <div className="text-slate-500 text-[10px]"># ollama pull nomic-embed-text</div>
          </div>
        </div>
      </GlassPanelStrong>

      {/* User Information */}
      <GlassPanel className="p-6 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Active Session Information</span>
        </div>
        <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
          <div>Display Name: <strong className="text-slate-900 dark:text-slate-100">{user?.displayName}</strong></div>
          <div>Email: <strong className="text-slate-900 dark:text-slate-100">{user?.email}</strong></div>
          <div>Role: <strong className="text-slate-900 dark:text-slate-100">{user?.role}</strong></div>
          <div>User ID: <span className="font-mono text-slate-500 dark:text-slate-400">{user?.id}</span></div>
        </div>
      </GlassPanel>
    </div>
  );
};
