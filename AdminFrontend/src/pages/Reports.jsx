import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Reports.css";

const Reports = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [selectedQuiz, setSelectedQuiz] = useState("All Quizzes");
  const [selectedSex, setSelectedSex] = useState("All Genders");
  const [scoreThreshold, setScoreThreshold] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/quiz-results");
        const data = res.data || [];
        setResults(data);
        setFilteredResults(data);

        // Extract unique quizzes for filter
        const uniqueQuizzes = ["All Quizzes", ...new Set(data.map(r => r.quizId?.quizName).filter(Boolean))];
        setQuizzes(uniqueQuizzes);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError(err.response?.data?.message || "Failed to fetch quiz results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter Logic
  useEffect(() => {
    let updatedResults = results;

    if (selectedQuiz !== "All Quizzes") {
      updatedResults = updatedResults.filter(r => r.quizId?.quizName === selectedQuiz);
    }

    if (selectedSex !== "All Genders") {
      updatedResults = updatedResults.filter(r => r.userId?.sex === selectedSex);
    }

    if (scoreThreshold !== "") {
      updatedResults = updatedResults.filter(r => r.score >= parseInt(scoreThreshold));
    }

    setFilteredResults(updatedResults);
  }, [selectedQuiz, selectedSex, scoreThreshold, results]);

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

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Quiz:</label>
          <select value={selectedQuiz} onChange={(e) => setSelectedQuiz(e.target.value)}>
            {quizzes.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Sex:</label>
          <select value={selectedSex} onChange={(e) => setSelectedSex(e.target.value)}>
            <option value="All Genders">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Min Score:</label>
          <input
            type="number"
            placeholder="E.g. 5"
            value={scoreThreshold}
            onChange={(e) => setScoreThreshold(e.target.value)}
          />
        </div>

        <button className="reset-btn" onClick={() => {
          setSelectedQuiz("All Quizzes");
          setSelectedSex("All Genders");
          setScoreThreshold("");
        }}>Reset</button>
      </div>

      <div className="report-header">
        <p>Showing {filteredResults.length} / {results.length} results</p>
      </div>
      <div className="report-section">
        {filteredResults.length > 0 ? (
          filteredResults.map((result, index) => {
            const userName = result.userId?.name || result.userId?.userId || result.userId?.email || "Anonymous";
            const userSex = result.userId?.sex || "N/A";
            const quizName = result.quizId?.quizName || "Unknown Quiz";
            const totalQuestions = result.answers ? Object.keys(result.answers).length : 0;
            const percentage = totalQuestions > 0 ? ((result.score / totalQuestions) * 100).toFixed(1) : 0;

            return (
              <div key={result._id || index} className="report-card">
                <div className="report-card-header">
                  <h3>{userName} ({userSex})</h3>
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
            <p>No results match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
