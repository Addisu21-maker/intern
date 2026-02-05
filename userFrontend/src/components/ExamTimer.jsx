import React from 'react';
import '../styles/componentstyle/ExamTimer.css';

const ExamTimer = ({ timeLeft }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="exam-timer">
      <p>Time Left: {formatTime(timeLeft)}</p>
    </div>
  );
};

export default ExamTimer;
