import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';
import { GlassPanelStrong } from '../components/GlassPanel';
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative font-sans text-[#29282B] selection:bg-[#FF6F61] selection:text-white"
      style={{
        backgroundColor: '#EAE8E7',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(255, 205, 190, 0.45) 0px, transparent 40%),
          radial-gradient(circle at 85% 15%, rgba(255, 220, 205, 0.35) 0px, transparent 45%),
          radial-gradient(circle at 50% 90%, rgba(228, 202, 255, 0.5) 0px, transparent 55%),
          radial-gradient(circle at 20% 85%, rgba(254, 215, 226, 0.4) 0px, transparent 50%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Pink-Lavender Bottom Ambient Glow */}
      <div
        className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none opacity-40 z-0"
        style={{
          background: 'linear-gradient(to top, rgba(220, 190, 255, 0.45) 0%, rgba(255, 195, 215, 0.2) 60%, transparent 100%)',
          filter: 'blur(45px)',
        }}
      />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo with 3D Glossy Sphere */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="sense-orb-icon w-12 h-12 shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-[#29282B] tracking-tight">Create an Account</h1>
          <p className="text-xs text-[#77747A] font-medium">Join AI Research Discovery and start synthesizing evidence</p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-[28px] border border-white/95 shadow-[0_16px_40px_-8px_rgba(41,40,43,0.06)] space-y-6"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#29282B] font-semibold mb-1.5 px-1">Full Name / Display Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-4 text-[#8E8B92]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#29282B] placeholder:text-[#8E8B92] bg-white border border-white/95 shadow-[0_2px_8px_rgba(41,40,43,0.03)] focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#29282B] font-semibold mb-1.5 px-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-4 text-[#8E8B92]" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#29282B] placeholder:text-[#8E8B92] bg-white border border-white/95 shadow-[0_2px_8px_rgba(41,40,43,0.03)] focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#29282B] font-semibold mb-1.5 px-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-[#8E8B92]" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#29282B] placeholder:text-[#8E8B92] bg-white border border-white/95 shadow-[0_2px_8px_rgba(41,40,43,0.03)] focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#29282B] font-semibold mb-1.5 px-1">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-[#8E8B92]" />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs text-[#29282B] placeholder:text-[#8E8B92] bg-white border border-white/95 shadow-[0_2px_8px_rgba(41,40,43,0.03)] focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 font-medium"
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
          <div className="pt-4 border-t border-slate-100/90 space-y-2">
            <div className="flex items-center space-x-2 text-[11px] text-[#615E65]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full access to scholarly PDF chunking & vector search</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-[#615E65]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Strict provenance separation: Reported vs AI vs Human</span>
            </div>
          </div>

          <div className="text-center text-xs text-[#77747A]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6F61] hover:text-[#E24354] underline font-semibold transition">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
