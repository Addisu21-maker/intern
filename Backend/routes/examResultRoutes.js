import express from 'express';
const router = express.Router();
import Exam from '../models/examModel.js';
import ExamResult from '../models/examResultModel.js';
import mongoose from 'mongoose';

// GET: Fetch results for a specific user
router.get('/user/:userId/results', async (req, res) => {
    const { userId } = req.params;
    try {
        const results = await ExamResult.find({ userId: new mongoose.Types.ObjectId(userId) })
            .populate('examId', 'examName');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching user results:', err);
        res.status(500).json({ message: 'Failed to fetch user results' });
    }
});

// GET: Fetch all exam results
router.get('/exam-results', async (req, res) => {
    try {
        const results = await ExamResult.find()
            .populate('userId', 'name email userId sex') // populate user details including sex
            .populate('examId', 'examName')  // populate exam name
            .sort({ timestamp: -1 }); // Sort by most recent first

        console.log(`Fetched ${results.length} exam results`);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching exam results:', err);
        res.status(500).json({ message: 'Failed to fetch exam results', error: err.message });
    }
});

export default router;
