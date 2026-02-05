import React, { useState, useEffect } from 'react';
import '../styles/modal.css'; // Assuming we can reuse existing modal styles or inline styles like QuestionManagement

const FetchPendingUsersModal = ({ setShowModal, fetchUsers, existingUsers, targetRole = 'user' }) => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/api/user/signups');
            if (!response.ok) throw new Error('Failed to fetch pending signups');

            const data = await response.json();

            // Filter out users who are already in the main user list (by email) 
            // AND filter out the main 'admin' account to avoid confusion
            // AND filter by the requested role (if stored in SignUp)
            const registeredEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
            const availableSignups = data.filter(u =>
                !registeredEmails.has(u.email.toLowerCase()) &&
                u.email.toLowerCase() !== 'admin@gmail.com' &&
                (targetRole === 'admin' ? u.role === 'admin' : (u.role === 'user' || !u.role))
            );

            // Transform data to match User model requirements
            const transformed = availableSignups.map(u => ({
                _id: u._id,
                userId: targetRole === 'user'
                    ? 'UID01' + Math.random().toString(36).substr(2, 6).toUpperCase()
                    : 'ADM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                name: u.name || u.email.split('@')[0],
                email: u.email,
                sex: u.sex || 'Male',
                role: targetRole,
                password: u.password
            }));

            setPendingUsers(transformed);
        } catch (err) {
            console.error(err);
            setError('Failed to load pending ' + targetRole + 's.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (user) => {
        try {
            // We'll use the bulk-add-users endpoint but for a single user, or create a loop if we wanted multiple.
            // But let's just make an array of one for the existing bulk endpoint.
            const userPayload = [{
                userId: user.userId,
                name: user.name,
                email: user.email,
                sex: user.sex,
                role: user.role,
                password: user.password, // Pass the existing hashed password
                // score is optional
            }];

            const response = await fetch('http://localhost:4000/api/bulk-add-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userPayload),
            });

            const data = await response.json();

            if (response.ok) {
                const message = targetRole === 'user'
                    ? `User ID: ${user.userId}\nPassword: [Hashed]`
                    : `Admin Approved Successfully!\nPassword: [Hashed]`;
                alert(message);
                // Remove from local list
                setPendingUsers(pendingUsers.filter(u => u.email !== user.email));
                // Refresh main user list
                fetchUsers();
            } else {
                alert(data.message || 'Failed to register user.');
            }
        } catch (err) {
            console.error(err);
            alert('Error registering user.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%', padding: '0', overflow: 'hidden' }}>
                {/* Red Close Header Button */}
                <button
                    onClick={() => setShowModal(false)}
                    style={{
                        width: '100%',
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textAlign: 'center'
                    }}
                >
                    Close
                </button>

                <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {!loading && !error && pendingUsers.length === 0 && (
                        <p>No new users to import.</p>
                    )}

                    {!loading && pendingUsers.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Name (Editable)</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map((user, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{user.email}</td>
                                        <td style={{ padding: '10px' }}>
                                            <input
                                                type="text"
                                                value={user.name}
                                                onChange={(e) => {
                                                    const newUsers = [...pendingUsers];
                                                    newUsers[index].name = e.target.value;
                                                    setPendingUsers(newUsers);
                                                }}
                                                style={{ padding: '5px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleRegister(user)}
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 20px',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FetchPendingUsersModal;
