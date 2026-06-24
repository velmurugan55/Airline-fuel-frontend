import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plane, Building2, Droplets, Receipt, BarChart3,
  LogOut, ChevronLeft, ChevronRight, FolderOpen, Activity, Shield,
  Users, Key, Lock, Menu, Settings, LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Icon lookup by name stored in the menu.icon field
const ICON_MAP = {
  LayoutDashboard, Plane, Building2, Droplets, Receipt, BarChart3,
  FolderOpen, Activity, Shield, Users, Key, Lock, Menu, Settings,
};

const getIcon = (name) => ICON_MAP[name] || FolderOpen;

// Static fallback (used when role has no RBAC role_id / no menus from API)
const STATIC_NAV = [
  { to: '/',            icon: 'LayoutDashboard', label: 'Dashboard',    end: true },
  { to: '/airlines',    icon: 'Plane',           label: 'Airlines' },
  { to: '/vendors',     icon: 'Building2',       label: 'Vendors' },
  { to: '/fuel-prices', icon: 'Droplets',        label: 'Fuel Prices' },
  { to: '/transactions',icon: 'Receipt',         label: 'Transactions' },
  { to: '/reports',     icon: 'BarChart3',       label: 'Reports' },
];

const sidebarVariants = {
  expanded:  { width: 260 },
  collapsed: { width: 72  },
};

function NavItem({ to, icon, label, collapsed, end }) {
  const Icon = getIcon(icon);
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon"><Icon size={17} strokeWidth={2} /></span>
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
  );
}

function buildTree(flatMenus) {
  const map = {};
  const roots = [];
  flatMenus.forEach(m => (map[m.menu_id] = { ...m, children: [] }));
  flatMenus.forEach(m => {
    if (m.parent_menu_id && map[m.parent_menu_id]) {
      map[m.parent_menu_id].children.push(map[m.menu_id]);
    } else if (!m.parent_menu_id) {
      roots.push(map[m.menu_id]);
    }
  });
  return roots;
}

function renderTree(nodes, collapsed) {
  return nodes.map(node => {
    if (node.children && node.children.length > 0) {
      return (
        <div key={node.menu_id}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="sidebar-section-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {node.menu_name}
              </motion.div>
            )}
          </AnimatePresence>
          {node.children.map(child => (
            child.route_path ? (
              <NavItem
                key={child.menu_id}
                to={child.route_path}
                icon={child.icon || 'FolderOpen'}
                label={child.menu_name}
                collapsed={collapsed}
              />
            ) : null
          ))}
        </div>
      );
    }
    if (node.route_path) {
      return (
        <NavItem
          key={node.menu_id}
          to={node.route_path}
          icon={node.icon || 'FolderOpen'}
          label={node.menu_name}
          collapsed={collapsed}
          end={node.route_path === '/'}
        />
      );
    }
    return null;
  });
}

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useAuth();
  const menus = user?.menus || [];
  const useDynamic = menus.length > 0;
  const treeNodes = useDynamic ? buildTree(menus) : null;
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const displayName = user?.username || 'User';
  const roleName = user?.role_name || user?.role || '';

  return (
    <motion.div
      className="app-sidebar"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Plane size={18} /></div>
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

        {useDynamic
          ? renderTree(treeNodes, collapsed)
          : STATIC_NAV.map(({ to, icon, label, end }) => (
              <NavItem key={to} to={to} icon={icon} label={label} collapsed={collapsed} end={end} />
            ))
        }
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info-box" title={collapsed ? displayName : undefined}>
          <div className="user-avatar">{initials}</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <div className="user-name">{displayName}</div>
                <div className="user-role">{roleName}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          className="nav-item"
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          style={{ cursor: 'pointer', color: 'var(--danger)', borderColor: 'transparent' }}
        >
          <span className="nav-icon"><LogOut size={17} strokeWidth={2} /></span>
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

        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', paddingTop: '0.25rem' }}>
          <button
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
