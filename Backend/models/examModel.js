import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    totalTime: { type: Number, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    passcode: { type: String, required: true },
    startDate: { type: String }, // Format YYYY-MM-DD
    startTime: { type: String }  // Format HH:mm
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
