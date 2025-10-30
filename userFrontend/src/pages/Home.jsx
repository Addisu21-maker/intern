import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pagesStyle/Home.css';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import FooterPage from '../components/Footer'

import quizPage from '../pages/quizPage.jsx';

export default function Home() {
  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <h1>Welcome to Quiz App</h1>
        </div>
        <div className="home-content">
          <p>
            Take quizzes on various topics based on your field like science, history, technology, and more then  Compete</p>
          <Link to="login">
            <button className="start-quiz-btn">Start Quiz</button>
          </Link>
        </div>
        <div className="home-footer">
          <p>Ready to take the quiz  up on  your knowledge? Let’s begin!</p>
        </div>
      </div>

      <About />
      <Contact />
      <quizPage />
    </>
  );
}
