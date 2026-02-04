import React, { useState } from 'react';
import '../styles/modal.css';

const BulkUserModal = ({ setShowModal, fetchUsers }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const result = [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const obj = {};
            const currentline = lines[i].split(',').map(c => c.trim());

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            // Ensure userId is present, generate if missing
            if (!obj.userid) {
                obj.userId = 'user_' + Math.random().toString(36).substr(2, 9);
            } else {
                obj.userId = obj.userid;
                delete obj.userid;
            }

            result.push(obj);
        }
        return result;
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        setLoading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const users = parseCSV(text);

                if (users.length === 0) {
                    setError('No users found in the CSV file.');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:4000/api/bulk-add-users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(users),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess(`${data.count} users registered successfully!`);
                    setTimeout(() => {
                        fetchUsers();
                        setShowModal(false);
                    }, 2000);
                } else {
                    setError(data.message || 'Failed to upload users.');
                }
            } catch (err) {
                setError('Error parsing or uploading file.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Bulk User Import</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                    Upload a CSV file with headers: <b>name, email, role</b> (optional: <b>userid</b>)
                </p>

                <div className="input-group">
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                {success && <p className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

                <div className="modal-buttons">
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="add-btn"
                        style={{ backgroundColor: '#3da5f5' }}
                    >
                        {loading ? 'Uploading...' : 'Upload & Register'}
                    </button>
                    <button
                        onClick={() => setShowModal(false)}
                        className="close-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUserModal;
