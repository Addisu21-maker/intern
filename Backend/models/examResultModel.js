import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true }, // Added for persistent tracking
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    score: { type: Number, required: true },
    answers: { type: mongoose.Schema.Types.Mixed, required: true },  // Store user's answers as object/map
    timeTaken: { type: Number }, // Time taken in minutes
    timestamp: { type: Date, default: Date.now },
});

const ExamResult = mongoose.model('ExamResult', examResultSchema);

export default ExamResult;
