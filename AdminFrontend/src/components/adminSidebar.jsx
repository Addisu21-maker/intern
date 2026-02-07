import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaQuestionCircle, FaUsers, FaThList, FaChartLine, FaEnvelope, FaTachometerAlt, FaUser } from "react-icons/fa";  // Importing icons
import "../styles/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail') || '';
      const response = await fetch(`http://localhost:4000/api/contact/pending-count?email=${adminEmail}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
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
        <a href="messages" style={{ color: unreadCount > 0 ? '#ef4444' : 'white' }}>
          <FaEnvelope className="sidebar-icon" style={{ color: unreadCount > 0 ? '#ef4444' : 'white' }} />
          <span className="sidebar-text">Messages</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
