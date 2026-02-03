import React, { useState, useEffect } from 'react';

const EditUserModal = ({ user, setShowModal, fetchUsers }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const [password, setPassword] = useState('');

  const handleUpdate = async () => {
    try {
      // 1. Update User Details
      const response = await fetch(`http://localhost:4000/api/users/edit-user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      // 2. Update Password (if provided)
      if (password.trim()) {
        const pwResponse = await fetch(`http://localhost:4000/api/users/change-password/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword: password }),
        });

        if (!pwResponse.ok) {
          throw new Error('User updated, but failed to update password');
        }
      }

      // Successfully updated user
      alert('User updated successfully');
      setShowModal(false); // Close modal after successful update
      fetchUsers(); // Re-fetch users to reflect the changes
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'An error occurred while updating the user.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit User</h3>
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
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
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
