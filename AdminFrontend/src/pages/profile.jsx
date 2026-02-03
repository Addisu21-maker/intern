import React, { useState, useEffect } from "react";
import "../styles/Reports.css"; // Reusing reports styles or create new one if needed, but sticking to existing for simplicity

const AdminProfile = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Get user info from localStorage (stored during login "user": {"email": ...})
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminEmail(user.email || '');
      } catch (e) {
        console.error("Error parsing user from local storage", e);
      }
    }
  }, []);

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

    try {
      const response = await fetch('http://localhost:4000/api/admin/change-password', {
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
    }
  };

  return (
    <div className="reports" style={{ padding: '20px' }}>
      <h2>Admin Profile</h2>
      <div className="profile-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
        <div className="info-group" style={{ marginBottom: '20px' }}>
          <strong>Email:</strong> {adminEmail || 'Loading...'}
        </div>

        <h3>Change Password</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
