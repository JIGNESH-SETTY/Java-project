import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
            <h1 className="text-2xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">Create an Account</h1>
            <span className="tag-engine">ENGINE</span>
          </div>
          <p className="text-xs text-[#5B6B7D] dark:text-[#8EB3C2] font-medium">Join RINNE and start discovering evidence-backed research</p>
        </div>

        {/* Auth Card (12px Radius) */}
        <div className="p-7 sm:p-8 rounded-[12px] border border-[#D9E1E9] dark:border-[#1E4656] shadow-sm space-y-5 bg-white dark:bg-[#122B36]">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-[9px] bg-[#FBE7E4] border border-[#F2C4BF] text-[#B3261E] text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#0B2A33] dark:text-[#E0F2F6] font-semibold mb-1.5 px-0.5">Full Name / Display Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-3.5 text-[#5B6B7D] dark:text-[#8EB3C2]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] text-xs text-[#0B2A33] dark:text-[#E0F2F6] placeholder:text-[#6B7785] bg-white dark:bg-[#0D222B] border border-[#C3CED9] dark:border-[#2A5A6E] shadow-2xs focus:bg-white dark:focus:bg-[#122B36] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0B2A33] dark:text-[#E0F2F6] font-semibold mb-1.5 px-0.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#5B6B7D] dark:text-[#8EB3C2]" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] text-xs text-[#0B2A33] dark:text-[#E0F2F6] placeholder:text-[#6B7785] bg-white dark:bg-[#0D222B] border border-[#C3CED9] dark:border-[#2A5A6E] shadow-2xs focus:bg-white dark:focus:bg-[#122B36] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0B2A33] dark:text-[#E0F2F6] font-semibold mb-1.5 px-0.5">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#5B6B7D] dark:text-[#8EB3C2]" />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Register'}
            </GlassButton>
          </form>

          {/* Account benefits */}
          <div className="pt-3 border-t border-[#D9E1E9] dark:border-[#1E4656] space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] text-[#475569] dark:text-[#8EB3C2]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B6B43] dark:text-[#34D399] shrink-0" />
              <span>Full access to scholarly PDF chunking &amp; vector search</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-[#475569] dark:text-[#8EB3C2]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B6B43] dark:text-[#34D399] shrink-0" />
              <span>Strict provenance separation: Reported vs AI vs Human</span>
            </div>
          </div>

          <div className="text-center text-xs text-[#5B6B7D] dark:text-[#8EB3C2]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A6A80] dark:text-[#38BDF8] hover:underline font-semibold transition">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
