import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/pagesStyle/login.css'; // Reusing some base styles

const ProfilePage = () => {
    const [userData, setUserData] = useState({
        name: localStorage.getItem('name') || '',
        email: '', // Fetch this
        userId: '', // ID to show (user_...)
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const id = localStorage.getItem('userId');
        if (!id) return;
        try {
            const response = await axios.get(`http://localhost:4000/api/users`);
            // The /api/users returns all users, find the matching one
            const current = response.data.find(u => u._id === id);
            if (current) {
                setUserData({
                    name: current.name,
                    email: current.email,
                    userId: current.userId
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const id = localStorage.getItem('userId');
        try {
            await axios.put(`http://localhost:4000/api/users/edit-user/${id}`, {
                name: userData.name
            });
            localStorage.setItem('name', userData.name);
            setMessage('Name updated successfully!');
            // Refresh local storage values
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            setError('Error updating name');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        const id = localStorage.getItem('userId');
        try {
            const response = await axios.put(`http://localhost:4000/api/users/change-password/${id}`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setMessage('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating password');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: '600px', flexDirection: 'column' }}>
                <div className="login-form" style={{ width: '100%' }}>
                    <h2 style={{ marginBottom: '20px' }}>My Profile</h2>

                    <div style={{ marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div className="form-group">
                            <label><strong>Name</strong></label>
                            <input
                                type="text"
                                value={userData.name}
                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                style={{ marginBottom: '10px' }}
                            />
                            <button onClick={handleNameUpdate} className="login-btn" style={{ padding: '5px 15px', fontSize: '14px', width: 'auto' }}>Update Name</button>
                        </div>
                        <p style={{ marginTop: '15px' }}><strong>Email:</strong> {userData.email}</p>
                        <p><strong>User ID:</strong> {userData.userId}</p>
                    </div>

                    <h3 style={{ marginBottom: '15px' }}>Change Password</h3>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
