import express from 'express';
const router = express.Router();
import Quiz from '../models/quizModel.js';
import QuizResult from '../models/quizResultModel.js';
import mongoose from 'mongoose';

// GET: Fetch results for a specific user
router.get('/user/:userId/results', async (req, res) => {
  const { userId } = req.params;
  try {
    const results = await QuizResult.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('quizId', 'quizName');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching user results:', err);
    res.status(500).json({ message: 'Failed to fetch user results' });
  }
});

// GET: Fetch all quiz results
router.get('/quiz-results', async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('userId', 'name email userId sex') // populate user details including sex
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
