import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Airlines from './pages/Airlines';
import Vendors from './pages/Vendors';
import FuelPrices from './pages/FuelPrices';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Roles from './pages/Roles';
import MenuManagement from './pages/MenuManagement';
import PermissionGuard from './components/PermissionGuard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<PermissionGuard><Dashboard /></PermissionGuard>} />
            <Route path="airlines"    element={<PermissionGuard><Airlines /></PermissionGuard>} />
            <Route path="vendors"     element={<PermissionGuard><Vendors /></PermissionGuard>} />
            <Route path="fuel-prices" element={<PermissionGuard><FuelPrices /></PermissionGuard>} />
            <Route path="transactions" element={<PermissionGuard><Transactions /></PermissionGuard>} />
            <Route path="reports"     element={<PermissionGuard><Reports /></PermissionGuard>} />

            {/* RBAC management routes */}
            <Route path="users"       element={<PermissionGuard><Users /></PermissionGuard>} />
            <Route path="roles"       element={<PermissionGuard><Roles /></PermissionGuard>} />
            <Route path="permissions" element={<PermissionGuard><Roles /></PermissionGuard>} />
            <Route path="menus"       element={<PermissionGuard><MenuManagement /></PermissionGuard>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
