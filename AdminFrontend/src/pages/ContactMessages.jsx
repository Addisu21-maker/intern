import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ContactMessages.css';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    // Helper function to display who replied
    const getRepliedByDisplay = (repliedBy) => {
        if (!repliedBy || repliedBy === 'Admin') return (isSuperAdmin ? 'Admin' : 'Admin');

        // Handle Super Admin case
        if (repliedBy === 'Super Admin') {
            return isSuperAdmin ? 'You' : 'Super Admin';
        }

        // Handle standard admin case - compare emails
        const currentEmail = (currentUserEmail || localStorage.getItem('adminEmail') || '').toLowerCase().trim();
        const repliedEmail = repliedBy.toLowerCase().trim();

        return repliedEmail === currentEmail ? 'You' : repliedBy;
    };

    const fetchMessages = async () => {
        try {
            const adminEmail = localStorage.getItem('adminEmail') || '';
            setCurrentUserEmail(adminEmail);
            const superAdminStatus = adminEmail === 'admin@gmail.com';
            setIsSuperAdmin(superAdminStatus);
            const response = await axios.get('http://localhost:4000/api/contact/all');

            let allMessages = response.data;

            // Filter for Standard Admins
            if (!superAdminStatus) {
                allMessages = allMessages.filter(msg =>
                    msg.senderRole === 'user' ||
                    msg.email.toLowerCase() === adminEmail.toLowerCase()
                );
            }

            setMessages(allMessages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleReplyClick = async (msg) => {
        setSelectedMessage(msg);
        setReplyMessage(msg.reply || '');
        setShowModal(true);

        // If an Admin opens a pending message, mark it as 'seen'
        if (msg.status === 'pending') {
            try {
                const adminEmail = localStorage.getItem('adminEmail') || localStorage.getItem('email') || 'Admin';
                const adminIdentifier = adminEmail === 'admin@gmail.com' ? 'Super Admin' : adminEmail;

                await axios.patch(`http://localhost:4000/api/contact/seen/${msg._id}`, { seenBy: adminIdentifier });
                fetchMessages();
            } catch (err) {
                console.error('Error marking as seen:', err);
            }
        }
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;
        setSubmitting(true);
        try {
            const adminEmail = localStorage.getItem('adminEmail') || localStorage.getItem('email') || 'Admin';
            const adminIdentifier = adminEmail === 'admin@gmail.com' ? 'Super Admin' : adminEmail;

            await axios.post(`http://localhost:4000/api/contact/reply/${selectedMessage._id}`, {
                replyMessage,
                repliedBy: adminIdentifier
            });
            alert('Reply sent successfully!');
            setShowModal(false);
            setReplyMessage('');
            fetchMessages(); // Refresh messages to show updated status
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please check your backend logs and .env settings.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await axios.delete(`http://localhost:4000/api/contact/${id}`);
            alert('Message deleted successfully!');
            fetchMessages(); // Refresh the list
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message.');
        }
    };

    return (
        <div className="contact-messages-container">
            <h2>Contact Messages</h2>
            {loading ? (
                <p className="loading-text">Loading messages...</p>
            ) : (
                <div className="messages-table-wrapper">
                    {messages.length === 0 ? (
                        <p className="no-messages">No messages found.</p>
                    ) : (
                        <table className="messages-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Replied By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((msg) => (
                                    <tr key={msg._id}>
                                        <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                        <td>{msg.name}</td>
                                        <td>{msg.email}</td>
                                        <td>{msg.message}</td>
                                        <td>
                                            <span className={`status-badge ${msg.status}`}>
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td>
                                            {msg.status === 'replied' ? (
                                                <span style={{ color: '#3da5f5', fontWeight: '500', fontSize: '0.9rem' }}>
                                                    {getRepliedByDisplay(msg.repliedBy)}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="reply-btn"
                                                    onClick={() => handleReplyClick(msg)}
                                                >
                                                    {(!isSuperAdmin && msg.senderRole === 'admin')
                                                        ? 'View'
                                                        : (msg.status === 'replied' ? 'View Reply' : 'Reply')}
                                                </button>

                                                {/* Only Super Admin can delete messages */}
                                                {isSuperAdmin && (
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(msg._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showModal && (
                <div className="reply-modal-overlay">
                    <div className="reply-modal">
                        <h3>{selectedMessage.status === 'replied' ? 'View Reply' : 'Reply to Message'}</h3>
                        <div className="message-details">
                            <p><strong>From:</strong> {selectedMessage.email.toLowerCase() === currentUserEmail.toLowerCase() ? 'You' : `${selectedMessage.name} (${selectedMessage.email})`}</p>
                            <p><strong>Original Message:</strong> {selectedMessage.message}</p>
                            {selectedMessage.status === 'seen' && selectedMessage.seenBy && (
                                <p style={{ color: '#666', fontSize: '14px' }}>
                                    <strong>Seen by:</strong> {selectedMessage.seenBy.toLowerCase() === currentUserEmail.toLowerCase() ? 'You' : selectedMessage.seenBy}
                                </p>
                            )}
                            {selectedMessage.status === 'replied' && (
                                <p>
                                    <strong>Replied by:</strong> {getRepliedByDisplay(selectedMessage.repliedBy)}
                                </p>
                            )}
                        </div>

                        {/* Show textarea only if message is pending/seen. If replied, show as read-only text. */}
                        {selectedMessage.status === 'replied' ? (
                            <div className="final-reply-view" style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #3da5f5' }}>
                                <strong>Final Response:</strong>
                                <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{selectedMessage.reply}</p>
                            </div>
                        ) : (
                            /* Only show textarea if it's a user message OR if Super Admin is replying to an admin */
                            (isSuperAdmin || selectedMessage.senderRole !== 'admin') && (
                                <textarea
                                    placeholder="Type your reply here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    disabled={submitting}
                                    style={{ width: '100%', minHeight: '100px', marginTop: '15px' }}
                                />
                            )
                        )}

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                            >
                                Close
                            </button>
                            {/* Hide Send button entirely if already replied to lock the response */}
                            {selectedMessage.status !== 'replied' && (isSuperAdmin || selectedMessage?.senderRole !== 'admin') && (
                                <button
                                    className="send-btn"
                                    onClick={handleSendReply}
                                    disabled={submitting || !replyMessage.trim()}
                                >
                                    {submitting ? 'Sending...' : 'Send Reply'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;
