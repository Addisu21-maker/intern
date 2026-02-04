import React, { useState } from 'react';
import axios from 'axios';

const EditUserModal = ({ user, setShowModal, fetchUsers }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [sex, setSex] = useState(user.sex || 'Male');
  const [userId, setUserId] = useState(user.userId);
  const [score, setScore] = useState(user.score);

  const [password, setPassword] = useState('');

  const handleUpdate = async () => {
    try {
      // 1. Update User Details
      await axios.put(`http://localhost:4000/api/users/edit-user/${user._id}`, {
        name,
        email,
        role,
        userId,
        score,
        sex,
      });

      // 2. Update Password (if provided)
      if (password.trim()) {
        await axios.put(`http://localhost:4000/api/users/change-password/${user._id}`, {
          newPassword: password,
        });
      }

      alert('User updated successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'An error occurred while updating the user.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit User</h3>
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <label>Sex</label>
        <select value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <label>Score</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <label>One-Time Password Change (Optional)</label>
        <input
          type="text"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={() => setShowModal(false)}>Cancel</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
