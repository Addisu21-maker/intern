import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/RequestTracking.css';

const RequestTracking = () => {
    const [email, setEmail] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:4000/api/contact/user/${email.trim()}`);
            setMessages(response.data);
            setHasSearched(true);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages. Please check your email and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="request-tracking-container">
            <h2>Track Your Queries</h2>

            <form className="email-search-section" onSubmit={handleSearch}>
                <input
                    type="email"
                    placeholder="Enter your email to see replies..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <div className="messages-list">
                {hasSearched && messages.length === 0 && (
                    <p className="no-messages-info">No messages found for this email address.</p>
                )}

                {!hasSearched && (
                    <p className="no-messages-info">Enter your email above to check the status of your reported issues.</p>
                )}

                {messages.map((msg) => (
                    <div key={msg._id} className="message-card">
                        <div className="card-header">
                            <span className="message-date">
                                {new Date(msg.createdAt).toLocaleString()}
                            </span>
                            <span className={`message-status ${msg.status}`}>
                                {msg.status}
                            </span>
                        </div>

                        <div className="original-message">
                            <strong>Your Request:</strong>
                            <p>{msg.message}</p>
                        </div>

                        {msg.status === 'replied' && (
                            <div className="admin-reply">
                                <strong>Response from {msg.repliedBy || 'Admin'}:</strong>
                                <p className="reply-content">{msg.reply}</p>
                                <p className="message-date" style={{ marginTop: '10px', fontSize: '12px' }}>
                                    Replied on {new Date(msg.repliedAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Link to="/logging" className="back-to-login">Back to Login</Link>
        </div>
    );
};

export default RequestTracking;
