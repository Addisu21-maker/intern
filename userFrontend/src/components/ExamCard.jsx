import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/pagesStyle/ExamCard.css';
import ExamTimer from './ExamTimer.jsx';

const ExamCard = () => {
  const { state } = useLocation();
  const { questions, examName, examId, totalTime } = state || {};
  const navigate = useNavigate();

  // Get userId from localStorage (MongoDB _id from login)
  const userId = localStorage.getItem('userId');
  const timerKey = `examTime-${examId}-${userId}`;

  // Initialize timer
  const storedTime = localStorage.getItem(timerKey);
  const initialTime = storedTime ? parseInt(storedTime) : (totalTime ? totalTime * 60 : 30 * 60);

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({}); // keyed by question._id
  const [examCompleted, setExamCompleted] = useState(false);
  const [examDuration, setExamDuration] = useState(initialTime);

  const QUESTIONS_PER_PAGE = 2;

  // Sync examDuration if totalTime changes
  useEffect(() => {
    if (totalTime) {
      const newTime = totalTime * 60;
      setExamDuration(newTime);
      localStorage.setItem(timerKey, newTime);
    }
  }, [totalTime, timerKey]);

  // Timer countdown
  useEffect(() => {
    if (examCompleted) return;

    const interval = setInterval(() => {
      setExamDuration(prev => {
        const newDuration = Math.max(0, prev - 1);
        localStorage.setItem(timerKey, newDuration);
        return newDuration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examCompleted, timerKey]);

  // Check for timeout
  useEffect(() => {
    if (examDuration === 0 && !examCompleted) {
      handleTimeUp();
    }
  }, [examDuration, examCompleted]);

  // Check if user has already taken this exam
  useEffect(() => {
    const checkExistingResult = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/user/${userId}/results`);
        const alreadyTaken = res.data.some(r => (r.examId?._id || r.examId) === examId);
        if (alreadyTaken) {
          navigate('/exams', { replace: true });
        }
      } catch (err) {
        console.error('Error checking existing results:', err);
      }
    };

    if (userId && examId) {
      checkExistingResult();
    }
  }, [userId, examId, navigate]);

  const handleTimeUp = () => {
    setExamCompleted(true);
    handleSubmit(true); // pass true to indicate auto-submit
  };

  // Handle option selection
  const handleOptionChange = (questionId, optionValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleNext = () => {
    if ((currentPage + 1) * QUESTIONS_PER_PAGE < questions.length) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) score += 1;
    });
    return score;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit exam
  const handleSubmit = async (isAuto = false) => {
    if (!userId) {
      alert('You must be logged in to submit the exam.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const score = calculateScore();
    const timeElapsedInSeconds = initialTime - examDuration; // Time spent on exam
    const timeTaken = (timeElapsedInSeconds / 60).toFixed(2); // Convert to minutes

    try {
      await axios.post(`http://localhost:4000/api/exams/${examId}/submit`, {
        userId,
        answers, // already keyed by question._id
        score,
        timeTaken
      });

      localStorage.removeItem(timerKey);
      setExamCompleted(true); // mark completed AFTER successful submission
    } catch (error) {
      console.error('Error submitting exam:', error.response || error);
      alert('Failed to submit exam. Please try again.');
      setIsSubmitting(false);
    }
  };


  const currentQuestions = questions?.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{examName}</h2>
        <ExamTimer timeLeft={examDuration} />
      </div>

      {examCompleted ? (
        <div className="quiz-completed-message">
          <h3>Thank you!</h3>
          <div className="result-summary">
            <p className="score-text">
              You got {calculateScore()} out of {questions.length}
            </p>


          </div>
          <button className="quiz-button" onClick={() => navigate('/exams')}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {currentQuestions && currentQuestions.length > 0 ? (
            <div className="quiz-question-card">
              {currentQuestions.map((question, index) => (
                <div key={question._id} className="quiz-question">
                  <p className="quiz-question-text">
                    <strong>Question {currentPage * QUESTIONS_PER_PAGE + index + 1}:</strong> {question.questionText}
                  </p>
                  <div className="quiz-options">
                    {question.options.map((option, idx) => (
                      <label
                        key={idx}
                        className={`quiz-option ${answers[question._id] === option ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value={option}
                          checked={answers[question._id] === option}
                          onChange={() => handleOptionChange(question._id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="quiz-navigation">
                <button className="quiz-button" onClick={handlePrevious} disabled={currentPage === 0}>
                  Previous
                </button>
                {(currentPage + 1) * QUESTIONS_PER_PAGE < questions.length ? (
                  <button className="quiz-button" onClick={handleNext}>Next</button>
                ) : (
                  <button className="quiz-button" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p>No questions available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ExamCard;
