import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  defaultRole = 'CUSTOMER',
}) => {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || 'Signed in successfully');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 500);
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      role,
      phone,
      drivingLicense: license,
    });
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || 'Account registered successfully');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 500);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const handleDemoAccess = async (targetRole: UserRole) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = await demoLogin(targetRole);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || `Demo access granted as ${targetRole}`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 500);
    } else {
      setError(res.message || '1-Click access failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0e1014] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 bg-[#12151b] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase">
              Veloce Fleet Access Portal
            </div>
            <h2 className="text-xl font-serif text-white mt-1">Authentication & Access Control</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* 1-Click Evaluation Bar */}
        <div className="p-4 bg-[#161a22] border-b border-white/5">
          <div className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase mb-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse"></span>
            1-Click Instant Evaluation Access
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess('ADMIN')}
              className="px-3 py-2.5 bg-gradient-to-r from-[#2a2216] to-[#1c1811] hover:from-[#3a2e1d] hover:to-[#262016] border border-[#c5a880]/40 text-[#f5e6d3] rounded-lg text-xs font-medium text-left flex flex-col justify-between transition group shadow-sm"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#e8c89b] text-[11px] uppercase tracking-wider">Fleet Operations</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c5a880]/20 text-[#c5a880] rounded">ADMIN</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1">Dispatch, settle, repairs & BI</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess('CUSTOMER')}
              className="px-3 py-2.5 bg-gradient-to-r from-[#14231f] to-[#0e1916] hover:from-[#1b302a] hover:to-[#12221e] border border-emerald-500/30 text-emerald-100 rounded-lg text-xs font-medium text-left flex flex-col justify-between transition group shadow-sm"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider">Private Client</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">CLIENT</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1">Bookings & reservation docket</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 text-xs font-mono uppercase tracking-wider">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-3 text-center transition ${
              tab === 'login'
                ? 'bg-white/5 text-[#c5a880] border-b-2 border-[#c5a880] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In with Email
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-3 text-center transition ${
              tab === 'register'
                ? 'bg-white/5 text-[#c5a880] border-b-2 border-[#c5a880] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono font-medium">{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#c5a880] hover:bg-[#d8be99] text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>

              <div className="text-[11px] text-center text-neutral-500 pt-1 font-mono">
                Admin: admin@velocefleet.com (admin123) &bull; Client: customer@velocefleet.com (customer123)
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="CUSTOMER">Customer / Client</option>
                    <option value="ADMIN">Fleet Operations / Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@example.com"
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Driver License ID
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="DL-9281-XYZ"
                    className="w-full bg-[#161a22] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#c5a880] hover:bg-[#d8be99] text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
