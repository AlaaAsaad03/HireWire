import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Skills from "./pages/Skills";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ApplicationDetails from "./pages/ApplicationDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { ThemeProvider } from "./context/ThemeContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import AppLayout from "./components/AppLayout";

import Landing from "./pages/Landing";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: "d",
      alt: true,
      callback: () => navigate("/dashboard"),
      description: "Go to dashboard",
    },
    {
      key: "c",
      alt: true,
      callback: () => navigate("/contacts"),
      description: "Go to contacts",
    },
    {
      key: "a",
      alt: true,
      callback: () => navigate("/analytics"),
      description: "Go to analytics",
    },
    {
      key: "s",
      alt: true,
      callback: () => navigate("/settings"),
      description: "Go to settings",
    },
  ]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Public Route Component (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advanced-analytics"
          element={
            <ProtectedRoute>
              <AdvancedAnalytics />
            </ProtectedRoute>
          }
        />

        {/* 404 - Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
