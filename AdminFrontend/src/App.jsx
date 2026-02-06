import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ExamManagement from "./pages/ExamManagement.jsx";
import UserManagement from "./pages/userManagement";
import CatagoryManagement from "./pages/categoryManagement.jsx";
import AdminProfile from './pages/profile.jsx'
import QuestionManagement from "./pages/QuestionManagement.jsx";
import Reports from "./pages/Reports";
import ContactMessages from "./pages/ContactMessages";
import RequestTracking from "./pages/RequestTracking";
import AdminHeader from "./components/adminHeader";
import Sidebar from "./components/adminSidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/adminStyles.css";
import LoginPage from "./pages/adminLogin.jsx";

import Signup from "./pages/signup.jsx";

// Component to conditionally render layout
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/logging' || location.pathname === '/signup' || location.pathname === '/request-tracking';

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return token !== null && token !== undefined;
  };

  // Don't show header/sidebar on login/signup pages
  if (isAuthPage) {
    return <div className="admin-app">{children}</div>;
  }

  // Show header/sidebar for authenticated users only
  // ProtectedRoute will handle redirect if not authenticated
  if (isAuthenticated()) {
    return (
      <div className="admin-app">
        <AdminHeader />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, ProtectedRoute will redirect, but render children for now
  return <div className="admin-app">{children}</div>;
};

const App = () => {
  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/logging" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-management"
          element={
            <ProtectedRoute>
              <ExamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/question-management"
          element={
            <ProtectedRoute>
              <QuestionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catagory-management"
          element={
            <ProtectedRoute>
              <CatagoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ContactMessages />
            </ProtectedRoute>
          }
        />
        <Route path="/request-tracking" element={<RequestTracking />} />
        {/* Default redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </LayoutWrapper>
  );
};

export default App;
