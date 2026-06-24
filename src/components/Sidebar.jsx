import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plane, Building2, Droplets,
  Receipt, BarChart3, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/airlines', icon: Plane, label: 'Airlines' },
  { to: '/vendors', icon: Building2, label: 'Vendors' },
  { to: '/fuel-prices', icon: Droplets, label: 'Fuel Prices' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout } = useAuth();

  return (
    <motion.div
      className="app-sidebar"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Plane size={18} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', minWidth: 0 }}
            >
              <div className="sidebar-logo-text">AeroFuel</div>
              <div className="sidebar-logo-sub">Fuel Management System</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="sidebar-section-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Main Menu
            </motion.div>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <span className="nav-icon">
              <Icon size={17} strokeWidth={2} />
            </span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className="nav-label"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User info */}
        <div className="user-info-box" title={collapsed ? 'Admin User' : undefined}>
          <div className="user-avatar">AD</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <div className="user-name">Admin User</div>
                <div className="user-role">Administrator</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          className="nav-item"
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          style={{ cursor: 'pointer', color: 'var(--danger)', borderColor: 'transparent' }}
        >
          <span className="nav-icon">
            <LogOut size={17} strokeWidth={2} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="nav-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', paddingTop: '0.25rem' }}>
          <button className="sidebar-toggle-btn" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
