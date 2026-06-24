import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const BREADCRUMBS = {
  '/': [{ label: 'Dashboard' }],
  '/airlines': [{ label: 'Airlines' }],
  '/vendors': [{ label: 'Vendors' }],
  '/fuel-prices': [{ label: 'Fuel Prices' }],
  '/transactions': [{ label: 'Transactions' }],
  '/reports': [{ label: 'Reports' }],
};

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/airlines': 'Airlines',
  '/vendors': 'Vendors',
  '/fuel-prices': 'Fuel Prices',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'AeroFuel';
  const crumbs = BREADCRUMBS[location.pathname] || [];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="app-topbar">
      {/* Breadcrumb / Title */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>AeroFuel</span>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--border-hover)' }}>/</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{c.label}</span>
            </React.Fragment>
          ))}
        </div>
        <h1
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="topbar-search" style={{ marginLeft: '1rem' }}>
        <Search size={14} className="topbar-search-icon" />
        <input type="text" placeholder="Search anything..." readOnly />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme toggle */}
        <button className="topbar-icon-btn" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="topbar-icon-btn" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#EF4444',
              border: '1.5px solid var(--topbar-bg)',
            }}
          />
        </button>

        {/* User dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setDropdownOpen(p => !p)}
          >
            <div className="topbar-avatar">{user?.username ? user.username.slice(0, 2).toUpperCase() : 'U'}</div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{user?.username || 'User'}</span>
            <ChevronDown
              size={13}
              style={{
                color: 'var(--text-muted)',
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                boxShadow: 'var(--shadow-xl)',
                minWidth: 200,
                zIndex: 200,
                overflow: 'hidden',
                animation: 'fadeIn 0.12s ease',
              }}
            >
              <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.username || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.role_name || user?.role || ''}</div>
              </div>
              <div style={{ padding: '0.375rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--danger)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--t-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
