import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminHeader.css";

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/logging"); // lowercase route
  };


  return (
    <header className="admin-header">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        Quiz Admin
      </div>
      <nav className="nav-links">
        <button id="logout" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default AdminHeader;
