import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 w-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--surface-color-solid)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }}/>
      <Sidebar />
      <div className="main-content d-flex flex-column flex-grow-1">
        <Topbar />
        <main className="content-area flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default MainLayout;
