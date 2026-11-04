import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { ScienceBackground } from '../components/ScienceBackground';

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
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans text-[#212832] dark:text-[#F5EFE6] selection:bg-[#948878] selection:text-white transition-colors overflow-hidden">
      {/* Science Illustration SVG Background (Auth Pages Only) */}
      <ScienceBackground />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo with Image */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="RINNE Logo" className="w-14 h-14 rounded-2xl shadow-lg object-contain hover:scale-105 transition-transform" />
          </div>
          <h1 className="text-2xl font-bold text-[#212832] dark:text-[#F5EFE6] tracking-tight">Create a RINNE Account</h1>
          <p className="text-xs text-[#7C7162] dark:text-[#948878] font-medium">Join RINNE and start discovering evidence-backed research</p>
        </div>

        {/* Floating Glass Card */}
        <div className="p-8 rounded-3xl border border-[#DFD1B7]/80 dark:border-[#393D46] shadow-xl space-y-6 bg-white/90 dark:bg-[#212832]/90 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#393D46] dark:text-[#DFD1B7] font-semibold mb-1.5 px-1">Full Name / Display Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-4 text-[#948878] dark:text-[#948878]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#212832] dark:text-[#F5EFE6] placeholder:text-[#948878] bg-[#FAF7F2] dark:bg-[#181C22] border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs focus:bg-white dark:focus:bg-[#212832] focus:outline-none focus:ring-2 focus:ring-[#948878]/30 focus:border-[#948878] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#393D46] dark:text-[#DFD1B7] font-semibold mb-1.5 px-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-4 text-[#948878] dark:text-[#948878]" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#212832] dark:text-[#F5EFE6] placeholder:text-[#948878] bg-[#FAF7F2] dark:bg-[#181C22] border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs focus:bg-white dark:focus:bg-[#212832] focus:outline-none focus:ring-2 focus:ring-[#948878]/30 focus:border-[#948878] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#393D46] dark:text-[#DFD1B7] font-semibold mb-1.5 px-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-[#948878] dark:text-[#948878]" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#212832] dark:text-[#F5EFE6] placeholder:text-[#948878] bg-[#FAF7F2] dark:bg-[#181C22] border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs focus:bg-white dark:focus:bg-[#212832] focus:outline-none focus:ring-2 focus:ring-[#948878]/30 focus:border-[#948878] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#393D46] dark:text-[#DFD1B7] font-semibold mb-1.5 px-1">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-[#948878] dark:text-[#948878]" />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#212832] dark:text-[#F5EFE6] placeholder:text-[#948878] bg-[#FAF7F2] dark:bg-[#181C22] border border-[#DFD1B7] dark:border-[#393D46] shadow-2xs focus:bg-white dark:focus:bg-[#212832] focus:outline-none focus:ring-2 focus:ring-[#948878]/30 focus:border-[#948878] font-medium transition-all"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              className="w-full mt-3 rounded-full cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </GlassButton>
          </form>

          {/* Account benefits */}
          <div className="pt-4 border-t border-[#DFD1B7]/60 dark:border-[#393D46] space-y-2">
            <div className="flex items-center space-x-2 text-[11px] text-[#5C5549] dark:text-[#C8BEAF]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full access to scholarly PDF chunking & vector search</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-[#5C5549] dark:text-[#C8BEAF]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Strict provenance separation: Reported vs AI vs Human</span>
            </div>
          </div>

          <div className="text-center text-xs text-[#7C7162] dark:text-[#948878]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#393D46] dark:text-[#DFD1B7] hover:underline font-semibold transition">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
