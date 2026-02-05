import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminHeader.css";

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/logging");
  };

  return (
    <header className="admin-header">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        SWZOES - Admin Panel
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
