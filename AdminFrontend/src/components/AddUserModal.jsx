import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import '../styles/modal.css'; // Ensure to style this modal in a separate file

const AddUserModal = ({ setShowModal, fetchUsers, switchToImport }) => {
  const [userData, setUserData] = useState({
    userId: '',
    name: '',
    email: '',
    role: 'user',
    sex: 'Male',
    score: 0
  });

  React.useEffect(() => {
    const generatedId = 'UID01' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setUserData(prev => ({ ...prev, userId: generatedId }));
  }, [setShowModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting user data:', userData); // Log the form data

    try {
      const response = await axios.post('http://localhost:4000/api/add-user', userData);

      console.log('User added successfully:', response.data);

      fetchUsers(); // Refresh the user list
      setShowModal(false); // Close modal after submitting
    } catch (error) {
      console.error('Error during user submission:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={userData.userId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="sex">Sex</label>
            <select
              id="sex"
              name="sex"
              value={userData.sex}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <button type="submit">Add User</button>
        </form>
        <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>

      </div>
    </div>
  );
};

export default AddUserModal;
