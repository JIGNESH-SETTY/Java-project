import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (!err.response) {
        setError('Cannot connect to backend server. Please ensure the backend is running on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#030712] font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo with 3D Cobalt Prism Lens */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="sense-orb-icon w-12 h-12 shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Research Discovery</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Evidence-Backed Scholarly Knowledge Engine</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 bg-white dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 px-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 px-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              className="w-full mt-3 rounded-full"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </GlassButton>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Need a new account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-semibold transition">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
