import React from 'react';
import '../styles/componentstyle/QuizTimer.css';

const QuizTimer = ({ timeLeft }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quiz-timer">
      <p>Time Left: {formatTime(timeLeft)}</p>
    </div>
  );
};

export default QuizTimer;
