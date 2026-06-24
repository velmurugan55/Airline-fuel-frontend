import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plane, Users, Droplet, ClipboardList, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="glass-panel" style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
      <div className="p-4 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <h5 className="m-0 d-flex align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          <Plane size={24} />
          <span className="fw-bold">AeroFuel</span>
        </h5>
      </div>
      
      <div className="flex-grow-1 p-3 d-flex flex-column gap-2">
        <NavLink to="/" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/airlines" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <Plane size={20} />
          <span>Airlines</span>
        </NavLink>
        <NavLink to="/vendors" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Vendors</span>
        </NavLink>
        <NavLink to="/fuel-prices" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <Droplet size={20} />
          <span>Fuel Prices</span>
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Transactions</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>
      </div>

      <div className="p-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
        <button 
          onClick={logout} 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
