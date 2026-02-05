import React from 'react';
import '../styles/pagesStyle/help.css';  // Importing the CSS file

const HelpPage = () => {
  return (
    <div className="help-container">
      <h1 className="help-heading">Help and Support</h1>

      <section className="section">
        <h2>How to take the exam</h2>
        <p className='text'>To start, select an exam category and choose your preferred field level. Once you're ready, click "Start Exam" and begin answering the questions. You can navigate through questions by clicking "Next" or choose to skip a question. After completing the exam, your score will be displayed.</p>
      </section>

      <section className="section">
        <h2>Scoring System</h2>
        <p className='text'>You earn points for each correct answer. There are no penalties for incorrect answers, but time is a factor, so answering quickly will help you score higher. Your final score will be shown at the end of the exam.</p>
      </section>



      <section className="section">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <li className='text'><strong>How do I reset my score?</strong> You can't reseat your score and leaderboard. </li>
        </ul>
      </section>


    </div>
  );
};

export default HelpPage;


