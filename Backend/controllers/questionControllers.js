import Question from '../models/questionModel.js';
import Exam from '../models/examModel.js';

export const addQuestion = async (req, res) => {
  try {
    const { examId, questionText, options, correctAnswer } = req.body;

    // Ensure all required fields are provided
    if (!examId || !questionText || !options.length || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch the exam to get its category
    const exam = await Exam.findById(examId).populate('categories');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Determine category name
    const categoryName = exam.categories && exam.categories.length > 0
      ? exam.categories[0].name
      : 'Uncategorized';

    // Create the new question
    const newQuestion = new Question({
      examId,
      questionText,
      options,
      correctAnswer,
      category: categoryName,
      examName: exam.examName
    });

    await newQuestion.save();

    // Update the exam to include the new question's ID
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    res.status(201).json({
      message: `Question added successfully to category: ${categoryName}`,
      question: newQuestion,
      exam: updatedExam,
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

    // Fetch the exam to get its category
    const examFound = await Exam.findById(examId).populate('categories');
    if (!examFound) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Determine category name (strictly from the exam)
    const categoryName = (examFound.categories && examFound.categories.length > 0)
      ? examFound.categories[0].name
      : 'Uncategorized';

    // Process questions - must have examId
    const processedQuestions = questions
      .filter(q => q.questionText && q.options && q.correctAnswer)
      .map(q => ({
        ...q,
        examId,
        category: categoryName,
        examName: examFound.examName
      }));

    if (processedQuestions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found. Each question must have questionText, options, and correctAnswer' });
    }

    const createdQuestions = await Question.insertMany(processedQuestions);

    const questionIds = createdQuestions.map(q => q._id);
    await Exam.findByIdAndUpdate(
      examId,
      { $push: { questions: { $each: questionIds } } },
      { new: true }
    );

    res.status(201).json({
      message: `${createdQuestions.length} questions uploaded successfully and assigned to category: ${categoryName}`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ message: 'Error uploading questions', error: error.message });
  }
};

// Delete all questions for a specific exam
export const deleteAllQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    // Delete all questions associated with this examId
    await Question.deleteMany({ examId });

    // Update the exam to clear its questions array
    await Exam.findByIdAndUpdate(
      examId,
      { $set: { questions: [] } },
      { new: true }
    );

    res.status(200).json({ message: 'All questions for this exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting all questions:', error);
    res.status(500).json({ message: 'Error deleting all questions' });
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
