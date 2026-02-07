import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use navigate hook from react-router-dom
import axios from 'axios'; // Import axios to send HTTP requests
import '../styles/adminLogin.css';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate(); // To navigate after success

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetName, setResetName] = useState("");
    const [resetMessage, setResetMessage] = useState("I forgot my password, please help me reset it.");

    // Function to handle forgot password submission
    async function handleForgotSubmit(e) {
        e.preventDefault();
        try {
            await axios.post("http://localhost:4000/api/contact/submit", {
                name: resetName,
                email: resetEmail,
                message: resetMessage
            });
            alert("Request sent successfully! Please check back later using the 'Request Tracking' button.");
            setShowForgotModal(false);
            setResetName("");
            setResetEmail("");
        } catch (err) {
            alert("Failed to send request.");
        }
    }



    // Function to handle form submission
    async function handleLogin(e) {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:4000/api/login", {
                email,
                password
            });
            console.log(response.data);

            // Store the token and user info in localStorage
            if (response.data.token) {
                localStorage.setItem("authToken", response.data.token);
                sessionStorage.setItem("authToken", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("email", response.data.user.email);
                localStorage.setItem("adminEmail", response.data.user.email);
            }

            setSuccessMessage("Login successful! Redirecting...");
            setTimeout(() => {
                navigate("/dashboard"); // Redirect to Dashboard page
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
            setTimeout(() => setError(""), 4000); // Clear error message after 4 seconds
        }
    }

    return (
        <div className="form-container">
            <div className="form">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <button type="submit" className="form-btn">Login</button>
                </form>
                <div className="redirect-link" style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>forget password? <span onClick={() => setShowForgotModal(true)} style={{ color: '#3da5f5', cursor: 'pointer', fontWeight: 'bold' }}>Contact Administrator</span></p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>view responses? <span onClick={() => navigate('/request-tracking')} style={{ color: '#3da5f5', cursor: 'pointer', fontWeight: 'bold' }}>Request Tracking</span></p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>Don't have an account? <Link to="/signup" style={{ color: '#3da5f5', fontWeight: 'bold', textDecoration: 'none' }}>Signup here</Link></p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>Contact Super Admin for Reset</h3>
                        <form onSubmit={handleForgotSubmit}>
                            <div className="form-group">
                                <label>Your Name</label>
                                <input type="text" value={resetName} onChange={(e) => setResetName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Your Email</label>
                                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    value={resetMessage}
                                    onChange={(e) => setResetMessage(e.target.value)}
                                    required
                                    style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowForgotModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="form-btn" style={{ padding: '8px 20px' }}>Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Replies Modal code removed as it is now a separate page */}

            <style>{`
                .admin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .admin-modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .cancel-btn {
                    padding: 8px 16px;
                    background: #eee;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
