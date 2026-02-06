import express from 'express';
import { addQuestion, getQuestionsByExamId, updateQuestion, deleteQuestion, uploadQuestions, getAllQuestions, deleteAllQuestions } from '../controllers/questionControllers.js';

const router = express.Router();

// Get all questions (Question Bank)
router.get('/all-questions', getAllQuestions);

// Bulk upload questions
router.post('/upload-questions', uploadQuestions);

// Add a question
router.post('/add-question', addQuestion);

// Get questions by exam ID
router.get('/questions/:examId', getQuestionsByExamId);

// Update a question by id
router.put('/update-question/:id', updateQuestion);

// Delete question by id
router.delete('/delete-question/:id', deleteQuestion);

// Delete all questions for an exam
router.delete('/delete-all-questions/:examId', deleteAllQuestions);

export default router;
