import React, { useState } from 'react';
import axios from 'axios';
import '../styles/modal.css';

const AddAdminModal = ({ setShowModal, fetchUsers }) => {
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        sex: 'Male'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData({ ...adminData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/add-admin', adminData);
            alert('Admin added successfully!');
            fetchUsers();
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding admin');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Add New Admin</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={adminData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={adminData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={adminData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Sex</label>
                        <select
                            name="sex"
                            value={adminData.sex}
                            onChange={handleChange}
                            required
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <button type="submit" style={{ backgroundColor: '#10b981' }}>Add Admin</button>
                </form>
                <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
        </div>
    );
};

export default AddAdminModal;
