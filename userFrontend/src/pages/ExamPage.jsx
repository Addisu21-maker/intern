import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pagesStyle/ExamPage.css';

const ExamPage = () => {
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [completedExamIds, setCompletedExamIds] = useState(new Set());
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

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

  // Fetch all exams and user's results
  const fetchData = async () => {
    try {
      // Fetch exams
      const examResponse = await axios.get('http://localhost:4000/api/exams');
      setExams(examResponse.data);

      // Fetch user's completed exams if logged in
      if (userId) {
        const resultResponse = await axios.get(`http://localhost:4000/api/user/${userId}/results`);
        const completedIds = new Set(resultResponse.data.map(r => r.examId?._id || r.examId));
        setCompletedExamIds(completedIds);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch questions and pass total time to ExamCard
  const fetchQuestions = async (examId, enteredPasscode) => {
    try {
      // 1️⃣ Fetch the latest exam info
      const examRes = await axios.get(`http://localhost:4000/api/exams`);
      const latestExam = examRes.data.find((q) => q._id === examId);

      if (!latestExam) {
        setMessage('Exam not found');
        return;
      }

      // 2️⃣ Check passcode and fetch questions
      const questionsRes = await axios.post(`http://localhost:4000/api/exam/${examId}/questions`, {
        passcode: enteredPasscode,
      });

      if (questionsRes.data && questionsRes.data.length > 0) {
        // 3️⃣ Navigate to ExamCard with latest totalTime
        navigate(`/exam/${examId}`, {
          state: {
            examId: latestExam._id,
            questions: questionsRes.data,
            examName: latestExam.examName,
            totalTime: latestExam.totalTime, // ✅ latest value
          },
        });
        setMessage('');
        setShowPasscodeModal(false);
      } else {
        setMessage('No questions available.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setShowPasscodeModal(false); // Close the modal
      if (error.response && error.response.status === 401) {
        setMessage('Incorrect passcode');
      } else {
        setMessage('Failed to fetch questions. Please try again.');
      }
    }
  };


  // Trigger when a user clicks on an exam
  const handleExamClick = (exam) => {
    if (completedExamIds.has(exam._id)) {
      setMessage('You have already completed this exam!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setSelectedExam(exam);
    setShowPasscodeModal(true);
  };

  // Handle passcode submission and fetch questions
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous error messages
    if (selectedExam) {
      await fetchQuestions(selectedExam._id, passcode);
    }
  };

  // Load data on page load
  useEffect(() => {
    fetchData();
  }, [userId]);

  return (
    <div>
      <h1 align="center ">Examinations Dashboard</h1>
      {message && (
        <div style={{
          textAlign: 'center',
          color: '#ef4444',
          background: '#fee2e2',
          padding: '10px',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '0 auto 20px',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}
      <div className="quizzes-container">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam._id}
              className={`quiz-card ${completedExamIds.has(exam._id) ? 'completed' : ''}`}
              onClick={() => !completedExamIds.has(exam._id) && handleExamClick(exam)}
            >
              <h3>{exam.examName}</h3>
              <p>Category: {exam.categories.map((cat) => cat.name).join(', ')}</p>
              {exam.startDate && (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  <b>Scheduled:</b> {exam.startDate} at {exam.startTime || 'N/A'}
                </p>
              )}
              <p>Time: {exam.totalTime} minutes</p>
              {completedExamIds.has(exam._id) ? (
                <button className="start-button" disabled style={{ backgroundColor: '#ccc', cursor: 'not-allowed' }}>
                  Completed
                </button>
              ) : (
                <button className="start-button">Start</button>
              )}
            </div>

          ))
        ) : (
          <p>No exams available at the moment.</p>
        )}
      </div>

      {showPasscodeModal && (
        <div className="passcode-modal">
          <form onSubmit={handlePasscodeSubmit}>
            <h3>Enter Passcode for taking the exam {selectedExam?.examName}</h3>
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

export default ExamPage;
