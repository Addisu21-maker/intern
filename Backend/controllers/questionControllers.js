import Question from '../models/questionModel.js';
import Exam from '../models/examModel.js';

export const addQuestion = async (req, res) => {
  try {
    const { examId, questionText, options, correctAnswer } = req.body;

    // Ensure all required fields are provided
    if (!examId || !questionText || !options.length || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create the new question
    const newQuestion = new Question({
      examId,
      questionText,
      options,
      correctAnswer,
    });

    await newQuestion.save();

    // Update the exam to include the new question's ID
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(201).json({
      message: 'Question added successfully',
      question: newQuestion,
      exam: updatedExam, // Optionally return the updated exam
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Error adding question' });
  }
};



// Fetch questions for a specific exam
export const getQuestionsByExamId = async (req, res) => {
  try {
    const { examId } = req.params; // Get the examId from the URL parameters

    // Find all questions related to the examId
    const questions = await Question.find({ examId });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this exam' });
    }

    // Return the list of questions
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};


// Update an existing question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Extract question ID from route params
    const { questionText, options, correctAnswer } = req.body;

    // Ensure required fields are provided
    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { questionText, options, correctAnswer },
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
};


//delete an exsting question

// Bulk upload questions
export const uploadQuestions = async (req, res) => {
  try {
    const { examId, questions } = req.body;

    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Exam ID and an array of questions are required' });
    }

    // Validate format of each question
    const validQuestions = questions.every(q => q.questionText && q.options && q.correctAnswer);
    if (!validQuestions) {
      return res.status(400).json({ message: 'Each question must have questionText, options, and correctAnswer' });
    }

    // Add examId to each question
    const questionsWithExamId = questions.map(q => ({ ...q, examId }));

    // Insert all questions
    const createdQuestions = await Question.insertMany(questionsWithExamId);

    // Get IDs of created questions
    const questionIds = createdQuestions.map(q => q._id);

    // Update the exam to include these new question IDs
    await Exam.findByIdAndUpdate(
      examId,
      { $push: { questions: { $each: questionIds } } },
      { new: true }
    );

    res.status(201).json({
      message: `${createdQuestions.length} questions uploaded successfully`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ message: 'Error uploading questions', error: error.message });
  }
};

// Delete an existing question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove the question reference from the Exam
    await Exam.findByIdAndUpdate(
      deletedQuestion.examId,
      { $pull: { questions: id } }
    );

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
};
// Get all questions (for question bank)
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};
