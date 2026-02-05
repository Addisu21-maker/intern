import express from 'express';
import Exam from '../models/examModel.js';
import Category from '../models/categoryModel.js';
import ExamResult from '../models/examResultModel.js';
import Quiz from '../models/quizModel.js';
import QuizResult from '../models/quizResultModel.js';
import {
    getAllExams,
    createExam,
    deleteExam,
    updateExam,
    addQuestionToExam,
    getExamQuestions,
    getExamById,
    submitExam
} from '../controllers/examController.js';

const router = express.Router();

// Fetch all exams
router.get('/exams', getAllExams);

// Fetch all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Add a question to an exam
router.post('/add-question-to-exam', addQuestionToExam);

// Create a new exam
router.post('/create-exam', createExam);

// Delete an exam by ID
router.delete('/delete-exam/:id', deleteExam);

// Fetch questions based on passcode
router.post('/exam/:id/questions', getExamQuestions);

// Edit exam
router.put('/edit-exam/:id', updateExam);

// Get specific exam by ID
router.get('/exam/:id', getExamById);

// Submit exam results
router.post('/exams/:examId/submit', submitExam);

// Get exam time limit
router.get('/exams/:examId/time-limit', async (req, res) => {
    const { examId } = req.params;
    try {
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        res.json({ totalTime: exam.totalTime });
    } catch (error) {
        console.error('Error fetching exam time limit:', error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Migrate legacy data
router.post('/migrate-data', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        const quizResults = await QuizResult.find();
        let migratedExams = 0;
        let migratedResults = 0;

        // Migrate Quizzes to Exams
        for (const quiz of quizzes) {
            let exam = await Exam.findOne({ examName: quiz.quizName });
            if (!exam) {
                exam = new Exam({
                    examName: quiz.quizName,
                    categories: quiz.categories,
                    totalTime: quiz.totalTime,
                    questions: quiz.questions,
                    passcode: quiz.passcode,
                    startDate: quiz.startDate,
                    startTime: quiz.startTime
                });
                await exam.save();
                migratedExams++;
            }
        }

        // Migrate Results
        for (const result of quizResults) {
            // Find the original quiz to get the name
            const quiz = quizzes.find(q => q._id.equals(result.quizId));
            if (quiz) {
                // Find corresponding exam
                const exam = await Exam.findOne({ examName: quiz.quizName });
                if (exam) {
                    // Check if result already exists
                    const existingResult = await ExamResult.findOne({
                        userId: result.userId,
                        examId: exam._id
                    });

                    if (!existingResult) {
                        const newResult = new ExamResult({
                            userId: result.userId,
                            examId: exam._id,
                            score: result.score,
                            answers: result.answers,
                            timeTaken: result.timeTaken,
                            timestamp: result.timestamp
                        });
                        await newResult.save();
                        migratedResults++;
                    }
                }
            }
        }

        res.status(200).json({
            message: 'Migration completed successfully',
            migratedExams,
            migratedResults
        });

    } catch (error) {
        console.error("Migration error:", error);
        res.status(500).json({ message: "Migration failed", error: error.message });
    }
});

export default router;
