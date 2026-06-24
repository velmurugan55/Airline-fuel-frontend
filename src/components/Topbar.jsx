import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/airlines': return 'Airlines Management';
      case '/vendors': return 'Vendors Management';
      case '/fuel-prices': return 'Fuel Prices';
      case '/transactions': return 'Fuel Transactions';
      default: return 'AeroFuel System';
    }
  };

  return (
    <header className="glass-panel p-3 d-flex justify-content-between align-items-center border-bottom border-end-0 border-start-0" style={{ borderBottomColor: 'var(--border-color)' }}>
      <h4 className="m-0 fw-semibold">{getPageTitle()}</h4>
      
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-link text-secondary p-0">
          <Bell size={20} />
        </button>
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <User size={18} />
          </div>
          <span className="fw-medium">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
