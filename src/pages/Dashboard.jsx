import React, { useEffect, useState } from 'react';
import { Plane, Users, Droplet, ClipboardList } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-4 hover-lift h-100">
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <p className="text-secondary mb-1">{title}</p>
        <h3 className="fw-bold mb-0">{value}</h3>
      </div>
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center" 
        style={{ width: '48px', height: '48px', backgroundColor: `${color}20`, color: color }}
      >
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    airlines: 0,
    vendors: 0,
    fuelPrices: 0,
    transactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch data from backend using the API client
        const [airlinesRes, vendorsRes, pricesRes, transRes] = await Promise.all([
          api.get('/airlines/'),
          api.get('/vendors/'),
          api.get('/fuel-prices/'),
          api.get('/transactions/')
        ]);
        
        setStats({
          airlines: airlinesRes.data.total !== undefined ? airlinesRes.data.total : airlinesRes.data.length,
          vendors: vendorsRes.data.total !== undefined ? vendorsRes.data.total : vendorsRes.data.length,
          fuelPrices: pricesRes.data.total !== undefined ? pricesRes.data.total : pricesRes.data.length,
          transactions: transRes.data.total !== undefined ? transRes.data.total : transRes.data.length
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Airlines" value={stats.airlines} icon={<Plane size={24} />} color="var(--primary-color)" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Fuel Vendors" value={stats.vendors} icon={<Users size={24} />} color="var(--success-color)" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Price Records" value={stats.fuelPrices} icon={<Droplet size={24} />} color="var(--warning-color)" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Transactions" value={stats.transactions} icon={<ClipboardList size={24} />} color="var(--secondary-color)" />
        </div>
      </div>

      <div className="glass-card p-4">
        <h5 className="mb-4">System Overview</h5>
        <div className="p-5 text-center text-secondary border rounded border-secondary border-opacity-25" style={{ borderStyle: 'dashed' }}>
          <ClipboardList size={48} className="mb-3 opacity-50" />
          <p className="mb-0">Welcome to AeroFuel. Navigate using the sidebar to manage airlines, vendors, prices, and transactions.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
