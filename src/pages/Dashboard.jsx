import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Building2, Droplets, Receipt, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] } }),
};

const KPI_CONFIG = [
  {
    key: 'airlines',
    label: 'Total Airlines',
    icon: Plane,
    color: '#2563EB',
    bg: 'var(--primary-light)',
    accent: '#2563EB',
    route: '/airlines',
  },
  {
    key: 'vendors',
    label: 'Fuel Vendors',
    icon: Building2,
    color: '#10B981',
    bg: 'var(--success-light)',
    accent: '#10B981',
    route: '/vendors',
  },
  {
    key: 'fuelPrices',
    label: 'Price Records',
    icon: Droplets,
    color: '#F59E0B',
    bg: 'var(--warning-light)',
    accent: '#F59E0B',
    route: '/fuel-prices',
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: Receipt,
    color: '#8B5CF6',
    bg: 'var(--purple-light)',
    accent: '#8B5CF6',
    route: '/transactions',
  },
];

const SkeletonCard = () => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 60, height: 32 }} />
      </div>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--r-lg)' }} />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ airlines: 0, vendors: 0, fuelPrices: 0, transactions: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [airlinesRes, vendorsRes, pricesRes, transRes] = await Promise.all([
          api.get('/airlines/'),
          api.get('/vendors/'),
          api.get('/fuel-prices/'),
          api.get('/transactions/'),
        ]);

        setStats({
          airlines: airlinesRes.data.total !== undefined ? airlinesRes.data.total : (airlinesRes.data.data || airlinesRes.data).length,
          vendors: vendorsRes.data.total !== undefined ? vendorsRes.data.total : (vendorsRes.data.data || vendorsRes.data).length,
          fuelPrices: pricesRes.data.total !== undefined ? pricesRes.data.total : (pricesRes.data.data || pricesRes.data).length,
          transactions: transRes.data.total !== undefined ? transRes.data.total : (transRes.data.data || transRes.data).length,
        });

        const allTrans = transRes.data.data || transRes.data || [];
        setRecentTransactions(allTrans.slice(-5).reverse());
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Welcome banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
          borderRadius: 'var(--r-xl)',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.375rem', letterSpacing: '-0.025em' }}>
            Welcome back, Admin
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
            Here's what's happening in your fuel management system today.
          </p>
        </div>
        <Plane size={64} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {loading
          ? KPI_CONFIG.map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-xl-3">
                <SkeletonCard />
              </div>
            ))
          : KPI_CONFIG.map((cfg, i) => {
              const Icon = cfg.icon;
              const value = stats[cfg.key];
              return (
                <div key={cfg.key} className="col-12 col-sm-6 col-xl-3">
                  <motion.div
                    className="stat-card"
                    style={{ '--card-accent': cfg.accent, cursor: 'pointer' }}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => navigate(cfg.route)}
                    whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="stat-card-label">{cfg.label}</div>
                        <div className="stat-card-value">{value}</div>
                        <span className="stat-card-trend trend-up">
                          <TrendingUp size={10} />
                          Active
                        </span>
                      </div>
                      <div className="stat-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={20} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
      </div>

      {/* Recent Transactions + Quick Actions */}
      <div className="row g-3">
        {/* Recent Transactions */}
        <div className="col-12 col-lg-8">
          <div className="table-card">
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Recent Transactions</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>Latest fuel purchase records</div>
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/transactions')}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--r-lg)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '60%', height: 10, marginBottom: 6 }} />
                      <div className="skeleton" style={{ width: '40%', height: 8 }} />
                    </div>
                    <div className="skeleton" style={{ width: 70, height: 10 }} />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Receipt size={22} /></div>
                <div className="empty-state-title">No transactions yet</div>
                <div className="empty-state-desc">Create your first fuel transaction to see it here.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Quantity (L)</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(t => (
                      <tr key={t.id}>
                        <td>
                          <span className="badge-base badge-primary" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {t.invoice_no}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.transaction_date}</td>
                        <td>{Number(t.fuel_quantity).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                          ₹{Number(t.total_amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12 col-lg-4">
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Quick Actions</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>Jump to key tasks</div>
            </div>
            <div style={{ padding: '0.625rem' }}>
              {[
                { label: 'New Transaction', sub: 'Record fuel purchase', icon: Receipt, color: '#2563EB', route: '/transactions' },
                { label: 'Manage Airlines', sub: 'Add or update airlines', icon: Plane, color: '#10B981', route: '/airlines' },
                { label: 'Update Fuel Price', sub: 'Set latest rate', icon: Droplets, color: '#F59E0B', route: '/fuel-prices' },
                { label: 'View Reports', sub: 'Export invoices', icon: TrendingUp, color: '#8B5CF6', route: '/reports' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(item.route)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--t-fast)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-lg)',
                        background: `${item.color}15`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }}>{item.label}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <ArrowRight size={13} style={{ color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
