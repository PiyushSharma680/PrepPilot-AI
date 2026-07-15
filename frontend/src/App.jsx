import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';

// Lazy-load all page components for performance
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const InterviewResult = lazy(() => import('./pages/InterviewResult'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const DSATracker    = lazy(() => import('./pages/DSATracker'));
const Roadmaps      = lazy(() => import('./pages/Roadmaps'));
const Fundamentals  = lazy(() => import('./pages/Fundamentals'));
const CompanyPrep   = lazy(() => import('./pages/CompanyPrep'));
const Notes         = lazy(() => import('./pages/Notes'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64 w-full">
    <div className="spinner spinner-lg" />
  </div>
);

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="sidebar-backdrop md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen md:ml-56">
        <div className="mobile-topbar md:hidden">
          <button
            type="button"
            className="btn btn-ghost p-2"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-800">PrepPilot AI</span>
        </div>

        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/interview"    element={<MockInterview />} />
              <Route path="/interview/:interviewId/result" element={<InterviewResult />} />
              <Route path="/resume"       element={<ResumeAnalyzer />} />
              <Route path="/dsa"          element={<DSATracker />} />
              <Route path="/roadmaps"     element={<Roadmaps />} />
              <Route path="/fundamentals" element={<Fundamentals />} />
              <Route path="/company-prep" element={<CompanyPrep />} />
              <Route path="/notes"        element={<Notes />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
