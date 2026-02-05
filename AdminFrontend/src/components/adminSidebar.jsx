import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaQuestionCircle, FaUsers, FaThList, FaChartLine, FaEnvelope, FaTachometerAlt, FaUser } from "react-icons/fa";  // Importing icons
import "../styles/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/logging");
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav>
        <a href="dashboard">
          <FaTachometerAlt className="sidebar-icon" />
          <span className="sidebar-text">Dashboard</span>
        </a>
        <a href="exam-management">
          <FaClipboardList className="sidebar-icon" />
          <span className="sidebar-text">Exams</span>
        </a>
        <a href="question-management">
          <FaQuestionCircle className="sidebar-icon" />
          <span className="sidebar-text">Questions</span>
        </a>
        <a href="user-management">
          <FaUsers className="sidebar-icon" />
          <span className="sidebar-text">Users</span>
        </a>
        <a href="catagory-management">
          <FaThList className="sidebar-icon" />
          <span className="sidebar-text">Categories</span>
        </a>
        <a href="reports">
          <FaChartLine className="sidebar-icon" />
          <span className="sidebar-text">Reports</span>
        </a>
        <a href="profile">
          <FaUser className="sidebar-icon" />
          <span className="sidebar-text">Profile</span>
        </a>
        <a href="messages">
          <FaEnvelope className="sidebar-icon" />
          <span className="sidebar-text">Messages</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
