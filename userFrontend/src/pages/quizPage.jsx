import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pagesStyle/quizPage.css';

const UserPage = () => {
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login page if not authenticated
    }
  }, [navigate]);

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch all quizzes on page load
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  // Fetch questions and pass total time to QuizCard
  const fetchQuestions = async (quizId, enteredPasscode) => {
    try {
      // 1️⃣ Fetch the latest quiz info
      const quizRes = await axios.get(`http://localhost:4000/api/quizzes`);
      const latestQuiz = quizRes.data.find((q) => q._id === quizId);

      if (!latestQuiz) {
        setMessage('Quiz not found');
        return;
      }

      // 2️⃣ Check passcode and fetch questions
      const questionsRes = await axios.post(`http://localhost:4000/api/quiz/${quizId}/questions`, {
        passcode: enteredPasscode,
      });

      if (questionsRes.data && questionsRes.data.length > 0) {
        // 3️⃣ Navigate to QuizCard with latest totalTime
        navigate(`/quiz/${quizId}`, {
          state: {
            quizId: latestQuiz._id,
            questions: questionsRes.data,
            quizName: latestQuiz.quizName,
            totalTime: latestQuiz.totalTime, // ✅ latest value
          },
        });
        setMessage('');
      } else {
        setMessage('No questions available.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage('Incorrect passcode or failed to fetch questions.');
    }
  };


  // Trigger when a user clicks on a quiz
  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPasscodeModal(true);
  };

  // Handle passcode submission and fetch questions
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz._id, passcode); // Fetch questions and redirect to the quiz card
      setShowPasscodeModal(false);
    }
  };

  // Load quizzes on page load
  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div>
      <h1 align="center ">Quizzes DashBoard</h1>
      <div className="quizzes-container">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="quiz-card"
              onClick={() => handleQuizClick(quiz)}
            >
              <h3>{quiz.quizName}</h3>
              <p>Category: {quiz.categories.map((cat) => cat.name).join(', ')}</p>
              <p>Time: {quiz.totalTime} minutes</p>
              <button className="start-button">Start</button>
            </div>
          ))
        ) : (
          <p>No quizzes available at the moment.</p>
        )}
      </div>

      {showPasscodeModal && (
        <div className="passcode-modal">
          <form onSubmit={handlePasscodeSubmit}>
            <h3>Enter Passcode for taking the quiz {selectedQuiz?.quizName}</h3>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              placeholder="Enter passcode"
            />
            <button type="submit">Submit</button>
            <Link to="/login">
              <button type="button" className="cancel-button">Cancel</button>
            </Link>
          </form>
          {message && <p>{message}</p>}
        </div>
      )}

      {/* Optionally, you can display questions here, but it's better to navigate to another page */}
      {questions.length > 0 && (
        <div className="questions-container">
          <h3>Questions</h3>
          {questions.map((question, index) => (
            <div key={index} className="question-card">
              <p>{question.questionText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;
