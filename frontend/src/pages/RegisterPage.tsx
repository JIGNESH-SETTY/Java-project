import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(email.trim(), password, displayName.trim());
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please ensure the backend is running on port 8080.');
      } else if (err.response.data?.validationErrors) {
        const firstValidation = Object.values(err.response.data.validationErrors)[0] as string;
        setError(firstValidation || 'Validation error');
      } else if (err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#181C22] font-sans text-slate-900 dark:text-[#F5EFE6] selection:bg-[#948878] selection:text-white transition-colors">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo with 3D Cobalt Prism Lens */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="sense-orb-icon w-12 h-12 shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join AI Research Discovery and start synthesizing evidence</p>
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
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 px-1">Full Name / Display Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 px-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 px-1">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Register'}
            </GlassButton>
          </form>

          {/* Account benefits */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full access to scholarly PDF chunking & vector search</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Strict provenance separation: Reported vs AI vs Human</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-semibold transition">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
