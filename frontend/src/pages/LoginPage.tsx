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
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans text-[#334155] dark:text-[#C4DDE5] selection:bg-[#0F4C5C] selection:text-white bg-[#F7F9FB] dark:bg-[#091920] transition-colors overflow-hidden">
      {/* Science Illustration SVG Background */}
      <ScienceBackground />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="RINNE Logo" className="w-12 h-12 rounded-[12px] object-contain shadow-md" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">RINNE</h1>
            <span className="tag-engine">ENGINE</span>
          </div>
          <p className="text-xs text-[#5B6B7D] dark:text-[#8EB3C2] font-medium">AI Research Discovery &amp; Evidence Engine</p>
        </div>

        {/* Auth Card (12px Radius per Claude Proposal) */}
        <div className="p-7 sm:p-8 rounded-[12px] border border-[#D9E1E9] dark:border-[#1E4656] shadow-sm space-y-5 bg-white dark:bg-[#122B36]">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-[9px] bg-[#FBE7E4] border border-[#F2C4BF] text-[#B3261E] text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#0B2A33] dark:text-[#E0F2F6] font-semibold mb-1.5 px-0.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#5B6B7D] dark:text-[#8EB3C2]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] text-xs text-[#0B2A33] dark:text-[#E0F2F6] placeholder:text-[#6B7785] bg-white dark:bg-[#0D222B] border border-[#C3CED9] dark:border-[#2A5A6E] shadow-2xs focus:bg-white dark:focus:bg-[#122B36] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0B2A33] dark:text-[#E0F2F6] font-semibold mb-1.5 px-0.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#5B6B7D] dark:text-[#8EB3C2]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] text-xs text-[#0B2A33] dark:text-[#E0F2F6] placeholder:text-[#6B7785] bg-white dark:bg-[#0D222B] border border-[#C3CED9] dark:border-[#2A5A6E] shadow-2xs focus:bg-white dark:focus:bg-[#122B36] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] font-medium transition-all"
                />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              className="w-full mt-3 rounded-[9px] cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </GlassButton>
          </form>
        </div>

        <div className="text-center text-xs text-[#5B6B7D] dark:text-[#8EB3C2]">
          Need a new account?{' '}
          <Link to="/register" className="text-[#0A6A80] dark:text-[#38BDF8] hover:underline font-semibold transition">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
