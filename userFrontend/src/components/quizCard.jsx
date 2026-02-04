import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/pagesStyle/quizCard.css';
import QuizTimer from './QuizTimer.jsx';

const QuizCard = () => {
  const { state } = useLocation();
  const { questions, quizName, quizId, totalTime } = state || {};
  const navigate = useNavigate();

  // Get userId from localStorage (MongoDB _id from login)
  const userId = localStorage.getItem('userId');
  const timerKey = `quizTime-${quizId}-${userId}`;

  // Initialize timer
  const storedTime = localStorage.getItem(timerKey);
  const initialTime = storedTime ? parseInt(storedTime) : (totalTime ? totalTime * 60 : 30 * 60);

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({}); // keyed by question._id
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizDuration, setQuizDuration] = useState(initialTime);

  const QUESTIONS_PER_PAGE = 2;

  // Sync quizDuration if totalTime changes
  useEffect(() => {
    if (totalTime) {
      const newTime = totalTime * 60;
      setQuizDuration(newTime);
      localStorage.setItem(timerKey, newTime);
    }
  }, [totalTime, timerKey]);

  // Timer countdown
  useEffect(() => {
    if (quizCompleted) return;

    const interval = setInterval(() => {
      setQuizDuration(prev => {
        const newDuration = Math.max(0, prev - 1);
        localStorage.setItem(timerKey, newDuration);
        return newDuration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizCompleted, timerKey]);

  // Check for timeout
  useEffect(() => {
    if (quizDuration === 0 && !quizCompleted) {
      handleTimeUp();
    }
  }, [quizDuration, quizCompleted]);

  // Check if user has already taken this quiz
  useEffect(() => {
    const checkExistingResult = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/user/${userId}/results`);
        const alreadyTaken = res.data.some(r => (r.quizId?._id || r.quizId) === quizId);
        if (alreadyTaken) {
          setQuizCompleted(true);
        }
      } catch (err) {
        console.error('Error checking existing results:', err);
      }
    };

    if (userId && quizId) {
      checkExistingResult();
    }
  }, [userId, quizId, navigate]);

  const handleTimeUp = () => {
    setQuizCompleted(true);
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

  // Submit quiz
  const handleSubmit = async (isAuto = false) => {
    if (!userId) {
      alert('You must be logged in to submit the quiz.');
      return;
    }

    const score = calculateScore();
    const timeElapsedInSeconds = initialTime - quizDuration; // Time spent on quiz
    const timeTaken = (timeElapsedInSeconds / 60).toFixed(2); // Convert to minutes
    console.log('Submitting quiz:', {
      userId,
      answers,
      score,
      timeTaken
    });
    try {
      await axios.post(`http://localhost:4000/api/quizzes/${quizId}/submit`, {
        userId,
        answers, // already keyed by question._id
        score,
        timeTaken
      });

      localStorage.removeItem(timerKey);
      setQuizCompleted(true); // mark completed AFTER successful submission
    } catch (error) {
      console.error('Error submitting quiz:', error.response || error);
      alert('Failed to submit quiz. Make sure you are logged in.');
    }
  };


  const currentQuestions = questions?.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quizName}</h2>
        <QuizTimer timeLeft={quizDuration} />
      </div>

      {quizCompleted ? (
        <div className="quiz-completed-message">
          <h3>Thank you, you got {calculateScore()} out of {questions.length}</h3>
          <button className="quiz-button" onClick={() => navigate('/quizPage')}>
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
                  <button className="quiz-button" onClick={handleSubmit}>Submit</button>
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

export default QuizCard;
