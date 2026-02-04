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

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/contact/all');
            // Sort messages by date descending (newest first)
            const sortedMessages = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setMessages(sortedMessages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleReplyClick = (msg) => {
        setSelectedMessage(msg);
        setReplyMessage(msg.reply || '');
        setShowModal(true);
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`http://localhost:4000/api/contact/reply/${selectedMessage._id}`, { replyMessage });
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
                                            <div className="action-buttons">
                                                <button
                                                    className="reply-btn"
                                                    onClick={() => handleReplyClick(msg)}
                                                >
                                                    {msg.status === 'replied' ? 'View Reply' : 'Reply'}
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(msg._id)}
                                                >
                                                    Delete
                                                </button>
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
                            <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                            <p><strong>Original Message:</strong> {selectedMessage.message}</p>
                        </div>
                        <textarea
                            placeholder="Type your reply here..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            disabled={submitting}
                        />
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                            >
                                Close
                            </button>
                            <button
                                className="send-btn"
                                onClick={handleSendReply}
                                disabled={submitting || !replyMessage.trim()}
                            >
                                {submitting ? 'Sending...' : selectedMessage.status === 'replied' ? 'Update Reply' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;
