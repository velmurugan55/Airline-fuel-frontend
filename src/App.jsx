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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="airlines" element={<Airlines />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="fuel-prices" element={<FuelPrices />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
