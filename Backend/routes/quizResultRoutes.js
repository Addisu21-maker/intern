import express from 'express';
const router = express.Router();
import Quiz from '../models/quizModel.js';
import QuizResult from '../models/quizResultModel.js';
import mongoose from 'mongoose';

// POST: Submit quiz result
router.post('/quizzes/:quizId/submit', async (req, res) => {

  const { userId, answers } = req.body;
  const { quizId } = req.params;

  if (!userId || !answers) {
    return res.status(400).json({ message: 'Missing userId or answers' });
  }

  try {
    const quiz = await Quiz.findById(quizId).populate('questions');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question) => {
      const qId = question._id.toString(); // use string
      if (answers[qId] === question.correctAnswer) {
        score += 1;
      }
    });

    // Save quiz result
    const newResult = new QuizResult({
      userId: new mongoose.Types.ObjectId(userId),
      quizId: new mongoose.Types.ObjectId(quizId),
      score,
      answers,
      timestamp: new Date(),
    });

    await newResult.save();

    return res.status(201).json({ message: 'Quiz submitted successfully', score });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET: Fetch all quiz results
router.get('/quiz-results', async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('userId', 'name email userId') // populate user details
      .populate('quizId', 'quizName')  // populate quiz name
      .sort({ timestamp: -1 }); // Sort by most recent first

    console.log(`Fetched ${results.length} quiz results`);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({ message: 'Failed to fetch quiz results', error: err.message });
  }
});

export default router;
