// QuizList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  // Fetch quizzes from the backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/quizzes'); // Adjust URL as needed
        setQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div>
      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>{quiz.quizName}</h3>
            {quiz.startDate && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                <strong>Scheduled for:</strong> {quiz.startDate} at {quiz.startTime || 'N/A'}
              </p>
            )}
            <p>{quiz.questionText}</p>
            <button
              className="start-quiz-btn"
              onClick={() => navigate(`/quiz/${quiz.id || quiz._id}`)}
              style={{ padding: '8px 16px', backgroundColor: '#3da5f5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Select Quiz
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;