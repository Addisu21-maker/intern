import express from 'express';
import { addQuestion, getQuestionsByExamId, updateQuestion, deleteQuestion, uploadQuestions, getAllQuestions } from '../controllers/questionControllers.js';

const router = express.Router();

// Get all questions (Question Bank)
router.get('/all-questions', getAllQuestions);

// Bulk upload questions
router.post('/upload-questions', uploadQuestions);

// Add a question
router.post('/add-question', addQuestion);

// Get questions by exam ID
router.get('/questions/:examId', getQuestionsByExamId);

//update a question by question id 

router.put('/update-question/:id', updateQuestion);

//delete question by  question id

router.delete('/delete-question/:id', deleteQuestion);


export default router;
