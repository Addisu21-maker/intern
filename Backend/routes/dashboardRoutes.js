import express from "express";
import User from "../models/userModel.js"; // Your existing User model
import Quiz from "../models/quizModel.js"; // Your existing Quiz model
const router = express.Router();

import QuizResult from "../models/quizResultModel.js";

router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await QuizResult.countDocuments();

    // Calculate overall pass rate (assuming pass is > 50% score for simplicity across all)
    // To do this accurately we need max score per quiz.
    // For now, let's use a simpler metric: Average Score across all attempts if max score is unavailable easily in aggregation
    // Or better, let's fetch all results and quizzes to compute.

    // Fetch all quizzes to map ID -> Question Count (Max Score)
    const quizzes = await Quiz.find().select('questions');
    const quizMaxScores = {};
    quizzes.forEach(q => {
      quizMaxScores[q._id.toString()] = q.questions.length;
    });

    const results = await QuizResult.find();
    let totalPasses = 0;

    results.forEach(r => {
      const maxScore = quizMaxScores[r.quizId.toString()] || 0;
      if (maxScore > 0 && r.score >= (maxScore / 2)) {
        totalPasses++;
      }
    });

    const passRate = totalAttempts ? ((totalPasses / totalAttempts) * 100).toFixed(2) : 0;

    res.json({
      users: totalUsers,
      quizzes: totalQuizzes,
      attempts: totalAttempts,
      passRate,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/dashboard-chart-data", async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('quizName questions');
    const results = await QuizResult.find();

    const chartData = quizzes.map(quiz => {
      const quizResults = results.filter(r => r.quizId.toString() === quiz._id.toString());
      const attempts = quizResults.length;

      let passes = 0;
      const maxScore = quiz.questions.length;

      if (maxScore > 0) {
        quizResults.forEach(r => {
          if (r.score >= (maxScore / 2)) passes++;
        });
      }

      const passRate = attempts ? ((passes / attempts) * 100).toFixed(1) : 0;

      return {
        quizName: quiz.quizName,
        attempts,
        passRate
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
