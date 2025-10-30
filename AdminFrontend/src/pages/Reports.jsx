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
        setResults(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch quiz results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <p>Loading quiz results...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="reports">
      <h2>Quiz Reports</h2>
      <div className="report-section">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="report-card">
              <h3>User: {result.userId?.name || result.userId?.email || "Anonymous"}</h3>
              <p>Quiz: {result.quizId?.quizName || "Unknown Quiz"}</p>
              <p>Score: {result.score}</p>

              <p>
                Date: {result.timestamp ? new Date(result.timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
          ))
        ) : (
          <p>No quiz results available.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
