import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, AuthRoute, VerifyEmailRoute } from './components/auth/ProtectedRoute';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { DashboardRoute } from './pages/DashboardRoute';
import { InvoiceRoute } from './pages/InvoiceRoute';
import { SettingsRoute } from './pages/SettingsRoute';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
        <Route path="/verify-email" element={<VerifyEmailRoute><VerifyEmailPage /></VerifyEmailRoute>} />

        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/invoice" element={<InvoiceRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
        </Route>

        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
