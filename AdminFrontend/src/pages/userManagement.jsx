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
  const [sexFilter, setSexFilter] = useState('All');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Store the user being edited
  const [isAddingUser, setIsAddingUser] = useState(false); // Track whether we are adding a user
  const [showAdminModal, setShowAdminModal] = useState(false); // Track Admin modal
  const adminEmail = localStorage.getItem('adminEmail') || '';
  const isSuperAdmin = adminEmail === 'admin@gmail.com';

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const dbUsers = await response.json();

      // Inject hardcoded Super Admin so it's visible in Management but not in DB
      const superAdminCode = {
        _id: 'SUPER_ADMIN_CODE_ID',
        userId: 'SUPER_ADMIN',
        name: 'Super Admin',
        email: 'admin@gmail.com',
        role: 'admin',
        sex: 'Male',
        isSystem: true // Flag to identify code-managed user
      };

      const finalUsers = [superAdminCode, ...dbUsers.filter(u => u.email !== 'admin@gmail.com')];
      setUsers(finalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input and sex
  useEffect(() => {
    if (users.length > 0) {
      let result = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      );

      if (sexFilter !== 'All') {
        result = result.filter(user => user.sex === sexFilter);
      }

      setFilteredUsers(result);
    } else {
      setFilteredUsers([]);
    }
  }, [search, users, sexFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/users/delete-user/${id}`, {
        method: 'DELETE',
        headers: { 'requester-email': adminEmail }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete account.');
        return;
      }

      setUsers(users.filter(user => user._id !== id));
      alert('Delete successful');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred.');
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!window.confirm('Are you sure you want to delete ALL regular users? This cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/users/delete-all-students', {
        method: 'DELETE',
        headers: { 'requester-email': adminEmail }
      });
      const data = await response.json();
      alert(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete all users.');
    }
  };

  const handleDeleteAllAdmins = async () => {
    if (!window.confirm('Are you sure you want to delete ALL other admins? Only Super Admin will remain.')) {
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/users/delete-all-admins', {
        method: 'DELETE',
        headers: { 'requester-email': adminEmail }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert(data.message);
      fetchUsers();
    } catch (error) {
      alert(error.message || 'Failed to delete all admins.');
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

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'admins'

  return (
    <div className="user-management-container">
      <div className="header">
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'users' ? (
            <>
              <button className="add-user-btn" onClick={handleAddUser}>
                + Add User
              </button>
              <button className="add-user-btn" style={{ backgroundColor: '#f59e0b' }} onClick={() => setShowPendingModal(true)}>
                Import Users
              </button>
              <button className="add-user-btn" style={{ backgroundColor: '#3da5f5' }} onClick={() => setShowBulkModal(true)}>
                Bulk Import
              </button>
              <button className="add-user-btn" style={{ backgroundColor: '#ef4444' }} onClick={handleDeleteAllUsers}>
                Delete All Users
              </button>
            </>
          ) : (
            <>
              {isSuperAdmin && (
                <>
                  <button className="add-user-btn" style={{ backgroundColor: '#10b981' }} onClick={() => setShowAdminModal(true)}>
                    + Add Admin
                  </button>
                  <button className="add-user-btn" style={{ backgroundColor: '#f59e0b' }} onClick={() => setShowPendingModal(true)}>
                    Import Admins
                  </button>
                  <button className="add-user-btn" style={{ backgroundColor: '#ef4444' }} onClick={handleDeleteAllAdmins}>
                    Delete All Admins
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #007bff' : 'none',
            color: activeTab === 'users' ? '#007bff' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Users
        </button>
        {isSuperAdmin && (
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
        )}
      </div>

      <div className="search-filter-wrapper" style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '8px 15px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <FaSearch style={{ color: '#94a3b8', fontSize: '1.2rem', marginRight: '10px' }} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '1rem',
            color: '#1e293b'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>
          <label style={{ color: '#64748b', fontWeight: '500', fontSize: '0.95rem' }}>Sex:</label>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '5px 10px',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            {activeTab === 'users' && <th>User ID</th>}
            <th>Name</th>
            <th>Email</th>
            <th>Sex</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .filter(user => activeTab === 'users' ? user.role === 'user' : user.role === 'admin')
            .length > 0 ? (
            filteredUsers
              .filter(user => activeTab === 'users' ? user.role === 'user' : user.role === 'admin')
              .map(user => (
                <tr key={user._id}>
                  {activeTab === 'users' && <td>{user.userId}</td>}
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.sex || 'Other'}</td>
                  <td>[Hashed]</td>
                  <td>
                    {user.isSystem ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>System User (Code Only)</span>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user)} className="edit-btn">
                          <FaEdit />
                        </button>
                        {(activeTab !== 'admins' || isSuperAdmin) && (
                          <button onClick={() => handleDelete(user._id)} className="delete-btn">
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={activeTab === 'users' ? 6 : 5}>No {activeTab} found</td>
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
          targetRole={activeTab === 'users' ? 'user' : 'admin'}
        />
      )}
    </div>
  );
};

export default UserManagement;
