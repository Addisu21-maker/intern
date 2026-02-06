import Exam from '../models/examModel.js';
import Question from '../models/questionModel.js';
import User from '../models/userModel.js';
import ExamResult from '../models/examResultModel.js';
import { sendEmail } from '../utils/emailService.js';

// Add a question to an exam
export const addQuestionToExam = async (req, res) => {
    const { examId, questionId } = req.body;

    try {
        if (!examId || !questionId) {
            return res.status(400).json({ message: 'Exam ID and Question ID are required' });
        }

        const exam = await Exam.findById(examId);
        const question = await Question.findById(questionId);

        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        exam.questions.push(questionId);
        await exam.save();

        res.status(200).json({ message: 'Question added to exam successfully', exam });
    } catch (error) {
        console.error('Error adding question to exam:', error);
        res.status(500).json({ message: 'Error adding question to exam' });
    }
};

// Create a new exam
export const createExam = async (req, res) => {
    try {
        const { examName, categories, totalTime, passcode, startDate, startTime } = req.body;

        if (!examName || !categories || !totalTime || !passcode) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newExam = new Exam({
            examName,
            categories,
            totalTime,
            passcode,
            startDate,
            startTime
        });

        await newExam.save();

        // Broadcast to students
        // Note: In a production app, use a job queue for this
        try {
            const students = await User.find({ role: 'user' });
            students.forEach(student => {
                sendEmail(
                    student.email,
                    `New Exam Published: ${examName}`,
                    `Hello ${student.name},\n\nA new exam has been published!\n\nExam Name: ${examName}\nStart Date: ${startDate || 'N/A'}\nStart Time: ${startTime || 'N/A'}\nPasscode: ${passcode}\n\nGood luck!\nAdmin Team`
                ).catch(err => console.error(`Failed to email ${student.email}:`, err.message));
            });
        } catch (emailError) {
            console.error('Error sending detailed emails:', emailError);
        }

        res.status(201).json({ message: 'Exam created successfully', exam: newExam });
    } catch (error) {
        console.error('Error creating exam:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Get all exams
export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('categories');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Get exam by ID
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('questions').populate('categories');
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
};

// Update an exam
export const updateExam = async (req, res) => {
    const { id } = req.params;
    const { examName, categories, totalTime, passcode, startDate, startTime } = req.body;

    try {
        const updatedExam = await Exam.findByIdAndUpdate(
            id,
            { examName, categories, totalTime, passcode, startDate, startTime },
            { new: true }
        );

        if (!updatedExam) return res.status(404).json({ message: 'Exam not found' });

        res.status(200).json({ message: 'Exam updated successfully', exam: updatedExam });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
};

// Delete an exam
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
};

// Get questions for an exam (with passcode check)
export const getExamQuestions = async (req, res) => {
    const { id } = req.params;
    const { passcode } = req.body;

    try {
        const exam = await Exam.findById(id).populate('questions');

        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Passcode check
        if (exam.passcode && exam.passcode !== passcode) {
            return res.status(401).json({ message: 'Incorrect passcode' });
        }

        res.status(200).json(exam.questions);
    } catch (error) {
        console.error('Error fetching exam questions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Submit exam results
export const submitExam = async (req, res) => {
    const { examId } = req.params;
    const { userId, answers, score, timeTaken } = req.body;

    try {
        if (!userId || !answers || score === undefined) {
            return res.status(400).json({ message: 'Missing required fields: userId, answers, and score are required' });
        }

        // Fetch user to get their email (for persistent tracking)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has already submitted this exam using their EMAIL (persistent)
        const existingResult = await ExamResult.findOne({
            userEmail: user.email,
            examId: examId
        });

        if (existingResult) {
            return res.status(403).json({ message: 'You have already submitted this exam. Duplicate attempts are not allowed.' });
        }

        const newResult = new ExamResult({
            userId,
            userEmail: user.email,
            examId,
            answers,
            score,
            timeTaken: timeTaken || 0,
            timestamp: new Date()
        });

        await newResult.save();
        res.status(201).json({ message: 'Exam submitted successfully', result: newResult });
    } catch (error) {
        console.error('Error saving exam result:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export default {
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    addQuestionToExam,
    getExamQuestions,
    submitExam
};
