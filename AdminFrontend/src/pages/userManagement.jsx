import React, { useState, useEffect } from 'react';
import '../styles/userManagement.css';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';
import AddAdminModal from '../components/AddAdminModal';
import BulkUserModal from '../components/BulkUserModal';
import FetchPendingUsersModal from '../components/FetchPendingUsersModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Store the user being edited
  const [isAddingUser, setIsAddingUser] = useState(false); // Track whether we are adding a user
  const [showAdminModal, setShowAdminModal] = useState(false); // Track Admin modal

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(data); // Save users to state
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input
  useEffect(() => {
    if (users.length > 0) {
      const result = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredUsers(result);
    } else {
      setFilteredUsers([]);
    }
  }, [search, users]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/users/delete-user/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting user:', errorData.message || 'Unknown error');
        alert('Failed to delete user. Please try again.');
        return;
      }

      const data = await response.json(); // Handle the response data
      setUsers(users.filter(user => user._id !== id)); // Remove deleted user from the UI
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user. Please try again later.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL users? (Admins will be protected). This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/users/delete-all', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete all students');

      const data = await response.json();
      alert(data.message);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting all users:', error);
      alert('Failed to delete all users.');
    }
  };

  // Handle user editing
  const handleEdit = (user) => {
    setSelectedUser(user); // Set the selected user to be edited
    setShowModal(true); // Show the modal
  };

  // Toggle add user modal visibility
  const handleAddUser = () => {
    setIsAddingUser(true); // Set the flag to show Add User Modal
    setShowModal(true); // Open the modal
  };

  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'admins'

  return (
    <div className="user-management-container">
      <div className="header">
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'students' ? (
            <>
              <button className="add-user-btn" onClick={handleAddUser}>
                + Add User
              </button>
              <button className="add-user-btn" style={{ backgroundColor: '#3da5f5' }} onClick={() => setShowBulkModal(true)}>
                Bulk Import
              </button>
            </>
          ) : (
            <>
              <button className="add-user-btn" style={{ backgroundColor: '#10b981' }} onClick={() => setShowAdminModal(true)}>
                + Add Admin
              </button>
              <button className="add-user-btn" style={{ backgroundColor: '#f59e0b' }} onClick={() => setShowPendingModal(true)}>
                Import Admins
              </button>
            </>
          )}

          <button className="add-user-btn" style={{ backgroundColor: '#ef4444' }} onClick={handleDeleteAll}>
            Delete All Users
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'students' ? '3px solid #007bff' : 'none',
            color: activeTab === 'students' ? '#007bff' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'admins' ? '3px solid #007bff' : 'none',
            color: activeTab === 'admins' ? '#007bff' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Admins
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Update search state
        />
        <FaSearch />
      </div>

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            {activeTab === 'students' && <th>User ID</th>}
            <th>Name</th>
            <th>Email</th>
            <th>Sex</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .filter(user => activeTab === 'students' ? user.role === 'user' : user.role === 'admin')
            .length > 0 ? (
            filteredUsers
              .filter(user => activeTab === 'students' ? user.role === 'user' : user.role === 'admin')
              .map(user => (
                <tr key={user._id}>
                  {activeTab === 'students' && <td>{user.userId}</td>}
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.sex || 'Other'}</td>
                  <td>[Hashed]</td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="edit-btn">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="delete-btn">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={activeTab === 'students' ? 6 : 5}>No {activeTab} found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add User Modal */}
      {showModal && (
        <AddUserModal
          setShowModal={setShowModal}
          fetchUsers={fetchUsers}
          isAddingUser={isAddingUser}
          setIsAddingUser={setIsAddingUser}
          switchToImport={() => {
            setShowModal(false);
            setShowPendingModal(true);
          }}
        />
      )}


      {showAdminModal && (
        <AddAdminModal
          setShowModal={setShowAdminModal}
          fetchUsers={fetchUsers}
        />
      )}

      {/* Edit User Modal */}
      {showModal && selectedUser && !isAddingUser && (
        <EditUserModal
          user={selectedUser}
          setShowModal={setShowModal}
          fetchUsers={fetchUsers}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <BulkUserModal
          setShowModal={setShowBulkModal}
          fetchUsers={fetchUsers}
        />
      )}

      {/* Fetch Pending Users Modal */}
      {showPendingModal && (
        <FetchPendingUsersModal
          setShowModal={setShowPendingModal}
          fetchUsers={fetchUsers}
          existingUsers={users}
          targetRole={activeTab === 'students' ? 'user' : 'admin'}
        />
      )}
    </div>
  );
};

export default UserManagement;
