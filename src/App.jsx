import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ReportGrievance from "./pages/ReportGrievance";
import TrackComplaint from "./pages/TrackComplaint";
import MyGrievances from "./pages/MyGrievances";
import Settings from "./pages/Settings";
import AuthorityDashboard from "./pages/AuthorityDashboard";


// --------------------------------------------------
// Scroll to top whenever route changes
// --------------------------------------------------

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}


// --------------------------------------------------
// Authentication loading screen
// --------------------------------------------------

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-[#0B1F3A] dark:bg-black dark:text-white">
      <div className="px-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#D97706] dark:border-[#262626] dark:border-t-[#F28C28]" />

        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading CivicAI...
        </p>
      </div>
    </main>
  );
}


// --------------------------------------------------
// Protected route
// --------------------------------------------------

function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// --------------------------------------------------
// Public-only route
// Logged-in users should not access login/register
// --------------------------------------------------

function PublicOnlyRoute({ children }) {
  const {
    isAuthenticated,
    loading,
    isAuthority,
  } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={isAuthority ? "/authority-dashboard" : "/"}
        replace
      />
    );
  }

  return children;
}


// --------------------------------------------------
// Authority-only route
// --------------------------------------------------

function AuthorityRoute({ children }) {
  const {
    isAuthenticated,
    isAuthority,
    loading,
  } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but not an authority
  if (!isAuthority) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


// --------------------------------------------------
// Application routes
// --------------------------------------------------

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* ---------------------------------------- */}
        {/* PUBLIC AUTH ROUTES                      */}
        {/* ---------------------------------------- */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ---------------------------------------- */}
        {/* CITIZEN ROUTES                          */}
        {/* ---------------------------------------- */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report-grievance"
          element={
            <ProtectedRoute>
              <ReportGrievance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-complaint"
          element={
            <ProtectedRoute>
              <TrackComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-grievances"
          element={
            <ProtectedRoute>
              <MyGrievances />
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


        {/* ---------------------------------------- */}
        {/* AUTHORITY ROUTE                         */}
        {/* ---------------------------------------- */}

        <Route
          path="/authority-dashboard"
          element={
            <AuthorityRoute>
              <AuthorityDashboard />
            </AuthorityRoute>
          }
        />


        {/* ---------------------------------------- */}
        {/* FALLBACK                                */}
        {/* ---------------------------------------- */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}


// --------------------------------------------------
// Root App
// --------------------------------------------------

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;