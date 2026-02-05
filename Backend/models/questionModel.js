import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: false }, // Made optional for question bank
    // categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    questionText: { type: String }, // Used by app
    question: { type: String }, // Used by manual legacy data
    options: [String],
    correctAnswer: String,
    category: String,
    difficulty: String
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
