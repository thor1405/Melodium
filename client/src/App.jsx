import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { TeamPage } from './pages/public/TeamPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { JamRoomBookingPage } from './pages/student/JamRoomBookingPage';
import { MyBookingsPage } from './pages/student/MyBookingsPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminTodaySchedulePage } from './pages/admin/AdminTodaySchedulePage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminCalendarPage } from './pages/admin/AdminCalendarPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Verifying authorization...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<Navigate to="/" replace />} />
          <Route path="/events/*" element={<Navigate to="/" replace />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/team" element={<TeamPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Jam Room Booking (Open to view, login required to submit) */}
          <Route path="/jam-room" element={<JamRoomBookingPage />} />

          {/* Protected Student Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Console */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="today-schedule" element={<AdminTodaySchedulePage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
          </Route>

          {/* Errors */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
