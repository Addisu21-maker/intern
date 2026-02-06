import React, { useState, useEffect } from "react";
import "../styles/profile.css";

const AdminProfile = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const storedEmail = localStorage.getItem('email');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminEmail(user.email || storedEmail || '');
      } catch (e) {
        console.error("Error parsing user from local storage", e);
        if (storedEmail) setAdminEmail(storedEmail);
      }
    } else if (storedEmail) {
      setAdminEmail(storedEmail);
    }
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    const userStr = localStorage.getItem('user');
    const storedEmail = localStorage.getItem('email');
    const email = storedEmail || (userStr ? JSON.parse(userStr).email : null);

    if (!email) return;

    try {
      const response = await fetch(`http://localhost:4000/api/user/signups`);
      const data = await response.json();
      const currentAdmin = data.find(u => u.email === email);
      if (currentAdmin) {
        setAdminName(currentAdmin.name || '');
      }
    } catch (err) {
      console.error("Error fetching admin info", err);
    }
  };


  const handleNameUpdate = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, name: adminName })
      });
      if (response.ok) alert("Name updated successfully!");
    } catch (err) {
      alert("Failed to update name");
    }
  };

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (!adminEmail) {
      alert("Admin email not found. Please log in again.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminEmail,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-profile">
      <h2>Admin Profile</h2>
      <div className="profile-card">
        <div className="info-group">
          <label><strong>Name</strong></label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            style={{ marginBottom: '10px', display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button onClick={handleNameUpdate} className="update-btn" style={{ fontSize: '14px', padding: '5px 15px', width: 'auto' }}>Update Name</button>
        </div>
        <div className="info-group" style={{ marginTop: '20px' }}>
          <strong>Email:</strong> {adminEmail || 'Loading...'}
        </div>

        <h3>Change Password</h3>
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter new password (min 6 chars)"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            className="update-btn"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
