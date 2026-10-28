import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@airesearch.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Research Discovery</h1>
          <p className="text-xs text-slate-500 font-medium">Evidence-Backed Scholarly Knowledge Engine</p>
        </div>

        {/* Glass Card */}
        <GlassPanelStrong className="p-8 rounded-3xl shadow-glass-hover space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full glass-input pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </GlassButton>
          </form>

          {/* Quick Demo Credentials Widget */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Quick 1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@airesearch.edu', 'admin123')}
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 text-left transition space-y-0.5 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Turing</span>
                </div>
                <div className="text-[10px] text-slate-500">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@airesearch.edu', 'student123')}
                className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 text-left transition space-y-0.5 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student Alex</span>
                </div>
                <div className="text-[10px] text-slate-500">student123</div>
              </button>
            </div>
          </div>
        </GlassPanelStrong>

        <div className="text-center text-xs text-slate-600">
          Need a new account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
