import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Reports.css";

const Reports = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/quiz-results");
        console.log("Backend results:", res.data); // Debug: check backend structure
        setResults(res.data || []);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError(err.response?.data?.message || "Failed to fetch quiz results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="reports">
        <h2>Quiz Reports</h2>
        <p>Loading quiz results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports">
        <h2>Quiz Reports</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="reports">
      <h2>Quiz Reports</h2>
      <div className="report-header">
        <p>Total Results: {results.length}</p>
      </div>
      <div className="report-section">
        {results.length > 0 ? (
          results.map((result, index) => {
            const userName = result.userId?.name || result.userId?.userId || result.userId?.email || "Anonymous";
            const quizName = result.quizId?.quizName || "Unknown Quiz";
            const totalQuestions = result.answers ? Object.keys(result.answers).length : 0;
            const percentage = totalQuestions > 0 ? ((result.score / totalQuestions) * 100).toFixed(1) : 0;
            
            return (
              <div key={result._id || index} className="report-card">
                <div className="report-card-header">
                  <h3>{userName}</h3>
                  <span className="report-date">
                    {result.timestamp ? new Date(result.timestamp).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="report-card-body">
                  <p><strong>Quiz:</strong> {quizName}</p>
                  <p><strong>Score:</strong> {result.score} / {totalQuestions} ({percentage}%)</p>
                  {result.timeTaken && (
                    <p><strong>Time Taken:</strong> {result.timeTaken} minutes</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>No quiz results available.</p>
            <p className="hint">Results will appear here once users complete quizzes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
