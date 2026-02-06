import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminHeader.css";

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    navigate("/logging");
  };

  const adminEmail = localStorage.getItem('adminEmail') || '';
  const isSuperAdmin = adminEmail === 'admin@gmail.com';

  return (
    <header className="admin-header">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        {isSuperAdmin ? "SWZOES - Super Admin Panel" : "SWZOES - Admin Panel"}
      </div>
      <div className="header-actions">
        <button className="logout-header-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
