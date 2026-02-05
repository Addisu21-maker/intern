import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pagesStyle/Home.css';

export default function Home() {
  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <h1>Welcome to South Wollo Zone Online Examination System</h1>
        </div>
        <div className="home-content">
          <p>
            A comprehensive online examination platform designed for job recruitment and candidate assessment. Evaluate your skills and competencies through structured examinations tailored to your field of expertise.</p>
          <Link to="login">
            <button className="start-quiz-btn">Start Exam</button>
          </Link>
        </div>
        <div className="home-footer">
          <p>Ready to demonstrate your skills and knowledge? Login to begin your examination!</p>
        </div>
      </div>
    </>
  );
}
