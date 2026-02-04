import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  quizName: { type: String, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  totalTime: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // New field
  passcode: { type: String, required: true },
  startDate: { type: String }, // Format YYYY-MM-DD
  startTime: { type: String }  // Format HH:mm
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;