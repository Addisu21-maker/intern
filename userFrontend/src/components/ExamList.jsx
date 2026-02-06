// ExamList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  const [takenExams, setTakenExams] = useState(new Set());

  // Fetch exams and user results from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem('email'); // Assuming email is stored in localStorage
        const userId = localStorage.getItem('userId');

        // Parallel fetch for exams and taken status
        const [examsRes, resultsRes] = await Promise.all([
          axios.get('http://localhost:4000/api/exams'),
          email ? axios.get(`http://localhost:4000/api/user/email/${email}/results`) : Promise.resolve({ data: [] })
        ]);

        setExams(examsRes.data);

        // Mark which exam IDs have already been taken
        const takenIds = new Set(resultsRes.data.map(r => r.examId?._id || r.examId));
        setTakenExams(takenIds);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
            {takenExams.has(exam._id) ? (
              <button
                disabled
                style={{ padding: '8px 16px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold' }}
              >
                Completed
              </button>
            ) : (
              <button
                className="start-exam-btn"
                onClick={() => navigate(`/exam/${exam._id}`)}
                style={{ padding: '8px 16px', backgroundColor: '#3da5f5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Select Exam
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamList;