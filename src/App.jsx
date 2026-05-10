import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LandingPage from './pages/student/LandingPage.jsx';
import LoginPage from './pages/student/LoginPage.jsx';
import RegisterPage from './pages/student/RegisterPage.jsx';
import MenuPage from './pages/student/MenuPage.jsx';
import BookingPage from './pages/student/BookingPage.jsx';
import TicketsPage from './pages/student/TicketsPage.jsx';
import TicketDetailPage from './pages/student/TicketDetailPage.jsx';

import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminMenuPage from './pages/admin/MenuManagerPage.jsx';
import AdminBookingsPage from './pages/admin/BookingsPage.jsx';
import AdminScanPage from './pages/admin/ScanPage.jsx';

import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="menu" element={<MenuPage />} />

        {/* Authenticated */}
        <Route
          path="menu/:itemId/book"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tickets/:bookingId"
          element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/menu"
          element={
            <ProtectedRoute requireAdmin>
              <AdminMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/scan"
          element={
            <ProtectedRoute requireAdmin>
              <AdminScanPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
