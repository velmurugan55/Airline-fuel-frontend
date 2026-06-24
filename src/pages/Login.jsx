import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Plane, Shield, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: Plane, text: 'Multi-airline fuel tracking' },
  { icon: Zap, text: 'Auto-generated invoices' },
  { icon: BarChart3, text: 'Real-time analytics & reports' },
  { icon: Shield, text: 'Secure JWT authentication' },
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-15%', left: '-8%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%',
          maxWidth: 900,
          background: 'white',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex',
          minHeight: 560,
        }}
      >
        {/* LEFT — Brand Panel */}
        <div
          style={{
            flex: '0 0 45%',
            background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {/* Top: Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2.5rem' }}>
              <div
                style={{
                  width: 38, height: 38,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Plane size={18} color="white" />
              </div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
                AeroFuel
              </span>
            </div>

            <h2
              style={{
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.2,
                margin: '0 0 0.875rem',
              }}
            >
              Airline Fuel
              <br />
              Management
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.875rem',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 280,
              }}
            >
              Streamline aviation fuel operations with real-time tracking,
              automated invoicing, and detailed analytics.
            </p>
          </div>

          {/* Middle: Feature list */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 30, height: 30,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color="rgba(255,255,255,0.85)" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', fontWeight: 500 }}>
                  {text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Bottom: version tag */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 6px #10B981',
                }}
              />
              System Online
            </span>
          </div>
        </div>

        {/* RIGHT — Form Panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 3rem',
            background: '#ffffff',
          }}
        >
          <div style={{ width: '100%', maxWidth: 340 }}>
            {/* Heading */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 0.375rem',
                  letterSpacing: '-0.03em',
                }}
              >
                Sign in
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                Enter your credentials to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {/* Username */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.375rem',
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.375rem',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '0.625rem 2.75rem 0.625rem 0.875rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      background: '#f8fafc',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#f8fafc';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      color: '#94a3b8', cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 6,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    cursor: 'pointer', userSelect: 'none',
                    fontSize: '0.8125rem', color: '#475569',
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: 14, height: 14, accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  Remember me
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.6875rem 1rem',
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.15s ease',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                  marginTop: '0.25rem',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.35)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Credentials hint */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                Default credentials: &nbsp;
                <strong style={{ color: '#475569' }}>admin</strong>
                &nbsp;/&nbsp;
                <strong style={{ color: '#475569' }}>admin123</strong>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
