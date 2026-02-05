import express from "express";
import User from "../models/userModel.js";
import Exam from "../models/examModel.js";
import ExamResult from "../models/examResultModel.js";

const router = express.Router();

router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // Count Exams
    const totalExams = await Exam.countDocuments();
    // Count Exam Attempts
    const totalAttempts = await ExamResult.countDocuments();

    // Calculate overall pass rate
    // We'll define a simple pass metric: score >= 50% of questions
    // This requires knowing the total possible questions for each exam.

    const exams = await Exam.find().select('questions');
    const examQuestionCounts = {};
    exams.forEach(e => {
      examQuestionCounts[e._id.toString()] = e.questions.length;
    });

    const results = await ExamResult.find();
    let totalPasses = 0;

    results.forEach(r => {
      const examId = r.examId._id ? r.examId._id.toString() : r.examId.toString();
      const maxScore = examQuestionCounts[examId] || 0;

      // If maxScore is 0, we can't really judge pass/fail properly, but let's assume if they got > 0 they passed? 
      // Or mostly safe to check score >= maxScore / 2
      if (maxScore > 0 && r.score >= (maxScore / 2)) {
        totalPasses++;
      }
    });

    const passRate = totalAttempts ? ((totalPasses / totalAttempts) * 100).toFixed(2) : 0;

    res.json({
      users: totalUsers,
      exams: totalExams,      // updated key from 'quizzes'
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
    const exams = await Exam.find().select('examName questions');
    const results = await ExamResult.find();

    const chartData = exams.map(exam => {
      const examResults = results.filter(r => {
        const rExamId = r.examId._id ? r.examId._id.toString() : r.examId.toString();
        return rExamId === exam._id.toString();
      });
      const attempts = examResults.length;

      let passes = 0;
      const maxScore = exam.questions.length;

      if (maxScore > 0) {
        examResults.forEach(r => {
          if (r.score >= (maxScore / 2)) passes++;
        });
      }

      const passRate = attempts ? ((passes / attempts) * 100).toFixed(1) : 0;

      return {
        examName: exam.examName, // updated key from 'quizName'
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
