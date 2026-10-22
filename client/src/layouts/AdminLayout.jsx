import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-3" />
        Checking Administrative Credentials...
      </div>
    );
  }

  // Guard: if not authenticated or not ADMIN, redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  // Determine current page title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/admin':
        return 'Admin Dashboard Overview';
      case '/admin/today-schedule':
        return "Today's Live Jam Room Timeline";
      case '/admin/bookings':
        return 'All Student Bookings';
      case '/admin/calendar':
        return 'Studio Calendar Schedule';
      case '/admin/users':
        return 'Registered Students & Musicians';
      case '/admin/gallery':
        return 'Photo Gallery Management';
      case '/admin/settings':
        return 'Jam Room Rules & Studio Parameters';
      case '/admin/analytics':
        return 'Jam Room Utilization & Reports';
      case '/admin/logs':
        return 'System & Reservation Activity Logs';
      default:
        return 'Melodium SJEC Admin';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
