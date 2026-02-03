import React, { useState, useEffect } from "react";
import '../styles/Dashborad.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    quizzes: 0,
    attempts: 0,
    passRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartData, setChartData] = useState([]);

  // Fetching stats data from backend
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await response.json();
      setStats({
        users: data.users || 0,
        quizzes: data.quizzes || 0,
        attempts: data.attempts || 0,
        passRate: data.passRate || 0,
      });
      // Don't set loading here main fetchData handles sequence
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Failed to load data. Please try again.");
    }
  };

  // Fetching globally
  const fetchData = async () => {
    try {
      await fetchDashboardStats();
      await fetchChartData();
    } catch (e) {
      console.error("Error in fetch chain", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/dashboard-chart-data");
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error("Error fetching chart data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Chart Configuration
  const barChartData = {
    labels: chartData.map(d => d.quizName),
    datasets: [
      {
        label: 'Attempts',
        data: chartData.map(d => d.attempts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Pass Rate (%)',
        data: chartData.map(d => d.passRate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Quiz Statistics' },
    },
  };

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stat-card">
          <h3>Quizzes</h3>
          <p>{stats.quizzes}</p>
        </div>
        <div className="stat-card">
          <h3>Attempts</h3>
          <p>{stats.attempts}</p>
        </div>
        <div className="stat-card">
          <h3>Pass Rate</h3>
          <p>{stats.passRate}%</p>
        </div>
      </div>

      <div className="charts-container" style={{ marginTop: '40px', padding: '20px', background: 'white', borderRadius: '8px' }}>
        <Bar options={chartOptions} data={barChartData} />
      </div>
    </div>
  );
};

export default Dashboard;
