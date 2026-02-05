import React, { useState, useEffect } from 'react';
import '../styles/pagesStyle/login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/exams');
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submit and login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/users/login', loginData);

      if (response.status === 200) {
        const user = response.data.user;

        localStorage.setItem('userId', user._id);  // store user _id for exam submission
        localStorage.setItem('token', user._id);   // optional
        localStorage.setItem('name', user.name);

        alert('Login successful!');
        navigate('/exams');  // redirect
      } else {
        alert('Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || 'Login failed.');
    }
  };



  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">User ID</label>
              <input
                type="text"
                id="username"
                name="userId"
                value={loginData.userId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
        <div className="vertical-line"></div>
        <div className="description">
          <h2>About the System</h2>
          <p>The South Wollo Zone Online Examination System is simple and intuitive with its own set of rules.</p>
          <p>
            Enter your user ID and  password that is given by the Admin, click the login button, and navigate to the dashboard to start answering examination questions.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
