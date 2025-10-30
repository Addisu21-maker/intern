import React from 'react';
import '../styles/pagesStyle/About.css'; // Importing the CSS file

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-heading">About Our Quiz App</h1>
        <p className="about-paragraph">


          Welcome to our Quiz Application!
          This platform is designed to make job recruitment smarter and easier for both employers and job applicants.

          Our goal is to help organizations test and evaluate candidates’ skills quickly and fairly through interactive online quizzes. Employers can create customized quizzes, review results instantly, and make better hiring decisions — all in one place. </p>
        <h3 className="features-heading">Key Features:</h3>
        <ul className="features-list">
          <li>🎯 Multiple categories to choose from</li>
          <li>⏱️ Timed quizzes for added challenge</li>
          <li>📈 Track your scores and progress</li>
          <li>🧠 Questions of varying difficulty levels</li>
          <li>🔗 Option to share your results with others</li>
        </ul>
        <p className="about-paragraph">
          The mission of this quiz application is to streamline the recruitment process by offering a reliable, automated system that assesses candidates’ competencies through customizable quizzes, ensuring objective evaluation and faster hiring decisions.  </p>
      </div>
    </div>
  );
};

export default AboutPage;
