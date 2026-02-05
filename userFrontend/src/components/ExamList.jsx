// ExamList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  // Fetch exams from the backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/exams'); // Adjust URL as needed
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, []);

  return (
    <div>
      <h2>Available Exams</h2>
      <ul>
        {exams.map((exam) => (
          <li key={exam.id || exam._id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>{exam.examName}</h3>
            {exam.startDate && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                <strong>Scheduled for:</strong> {exam.startDate} at {exam.startTime || 'N/A'}
              </p>
            )}
            <p>{exam.examName}</p>
            <button
              className="start-exam-btn"
              onClick={() => navigate(`/exam/${exam.id || exam._id}`)}
              style={{ padding: '8px 16px', backgroundColor: '#3da5f5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Select Exam
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamList;