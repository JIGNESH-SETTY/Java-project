import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { ScienceBackground } from '../components/ScienceBackground';

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
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans text-[#212832] dark:text-[#F5EFE6] selection:bg-[#948878] selection:text-white transition-colors overflow-hidden">
      {/* Science Illustration SVG Background (Auth Pages Only) */}
      <ScienceBackground />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo with Image */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="RINNE Logo" className="w-14 h-14 rounded-2xl shadow-lg object-contain hover:scale-105 transition-transform" />
          </div>
          <h1 className="text-2xl font-bold text-[#212832] dark:text-[#F5EFE6] tracking-tight">RINNE</h1>
          <p className="text-xs text-[#7C7162] dark:text-[#948878] font-medium">AI Research Discovery & Evidence Engine</p>
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
              <label className="block text-[#393D46] dark:text-[#DFD1B7] font-semibold mb-1.5 px-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-4 text-[#948878] dark:text-[#948878]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </GlassButton>
          </form>
        </div>

        <div className="text-center text-xs text-[#7C7162] dark:text-[#948878]">
          Need a new account?{' '}
          <Link to="/register" className="text-[#393D46] dark:text-[#DFD1B7] hover:underline font-semibold transition">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
