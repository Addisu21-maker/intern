import express from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/quizModel.js';
import Category from '../models/categoryModel.js';
import QuizResult from '../models/quizResultModel.js'; // Make sure this exists
import addQuestionToQuiz from '../controllers/quizController.js';

const router = express.Router();

// Fetch all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('categories');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Add a question to a quiz
router.post('/add-question-to-quiz', addQuestionToQuiz);

// Create a new quiz
router.post('/create-quiz', async (req, res) => {
  try {
    const { quizName, categories, totalTime, passcode } = req.body;
    if (!quizName || !categories || !totalTime || !passcode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newQuiz = new Quiz({
      quizName,
      categories,
      totalTime,
      passcode,
    });

    await newQuiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete a quiz by ID
router.delete('/delete-quiz/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
});

// Fetch questions based on passcode
router.post('/quiz/:id/questions', async (req, res) => {
  const { id } = req.params;
  const { passcode } = req.body;

  try {
    const quiz = await Quiz.findById(id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.passcode !== passcode) return res.status(401).json({ message: 'Incorrect passcode' });

    res.status(200).json(quiz.questions);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit quiz
router.put('/edit-quiz/:id', async (req, res) => {
  const quizId = req.params.id;
  const { quizName, categories, totalTime, passcode } = req.body;

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { quizName, categories, totalTime, passcode },
      { new: true }
    );
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz time limit
router.get('/quizzes/:quizId/time-limit', async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ totalTime: quiz.totalTime });
  } catch (error) {
    console.error('Error fetching quiz time limit:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ✅ Submit quiz results
router.post('/quizzes/:quizId/submit', async (req, res) => {
  const { quizId } = req.params;
  const { userId, answers, score, timeTaken } = req.body;

  console.log('Received quiz submission:', { quizId, userId, answers, score, timeTaken });

  try {
    if (!userId || !answers || score === undefined) {
      return res.status(400).json({ message: 'Missing required fields: userId, answers, and score are required' });
    }

    // Validate userId and quizId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId format' });
    }

    const newResult = new QuizResult({
      userId: new mongoose.Types.ObjectId(userId),
      quizId: new mongoose.Types.ObjectId(quizId),
      answers,
      score,
      timeTaken: timeTaken || 0,
      timestamp: new Date()
    });

    await newResult.save();
    console.log('Quiz result saved successfully:', newResult._id);
    res.status(201).json({ message: 'Quiz submitted successfully', result: newResult });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
