import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import '../styles/QuestionManagement.css';

const QuestionManagement = () => {
  const [exams, setExams] = useState([]); // For exams
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);

  // Fetch all questions for the bank
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/all-questions');
        if (response.ok) {
          const data = await response.json();
          setAllQuestions(data);
        }
      } catch (error) {
        console.error('Error fetching question bank:', error);
      }
    };
    if (showImportModal) {
      fetchAllQuestions();
    }
  }, [showImportModal]);

  const handleImportQuestion = async (question) => {
    if (!selectedExamId) {
      alert('Please select an exam first.');
      return;
    }

    // Create a copy of the question for the current exam
    const data = {
      examId: selectedExamId,
      questionText: question.questionText || question.question,
      options: question.options,
      correctAnswer: question.correctAnswer
    };

    try {
      const response = await fetch('http://localhost:4000/api/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Question imported successfully');
        fetchQuestions(); // Refresh current exam questions
      } else {
        alert('Failed to import question');
      }
    } catch (error) {
      console.error('Error importing question:', error);
      alert('Error importing question');
    }
  };

  const fetchQuestions = async () => {
    if (!selectedExamId) return; // Fetch questions only when an exam is selected
    try {
      const response = await fetch(
        `http://localhost:4000/api/questions/${selectedExamId}`
      );
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  useEffect(() => {
    fetchExams(); // Fetch exams when the component loads
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/exams');
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };


  const handleAddOrUpdateQuestion = async () => {
    if (!selectedExamId) {
      alert('Please select an exam before adding a question.');
      return;
    }

    const data = {
      examId: selectedExamId,
      questionText,
      options,
      correctAnswer,
    };

    try {
      const endpoint = editingQuestion
        ? `http://localhost:4000/api/update-question/${editingQuestion._id}`
        : 'http://localhost:4000/api/add-question';

      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(editingQuestion ? 'Question updated successfully' : 'Question added successfully');
        fetchQuestions(); // Fetch the updated question list
        resetForm(); // Reset form after successful add/update
      } else {
        alert('Failed to process the question');
      }
    } catch (error) {
      console.error('Error processing question:', error);
      alert('Error processing question');
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.questionText || question.question || '');
    setOptions(question.options || ['', '', '', '']);
    setCorrectAnswer(question.correctAnswer || '');
  };

  // Run fetch functions when component loads or when selected exam changes
  useEffect(() => {
    fetchExams(); // Fetch exams when the component loads
  }, []);

  useEffect(() => {
    fetchQuestions(); // Fetch questions when the selected exam changes
  }, [selectedExamId]);

  return (
    <div className="question-management">
      <h2>Manage Questions</h2>

      {/* Select Exam */}
      <div className="select-quiz">
        <h3>Select Exam</h3>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          <option value="" disabled>
            -- Select an Exam --
          </option>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <option key={exam._id} value={exam._id} className="quizName">
                {exam.examName}
              </option>
            ))
          ) : (
            <option disabled>No exams available</option>
          )}
        </select>
      </div>

      {/* Add or Edit Question */}
      <div className="add-question">
        <h3>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question text"
        />
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            placeholder={`Option ${index + 1}`}
          />
        ))}
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Correct answer"
        />
        <button onClick={handleAddOrUpdateQuestion}>
          {editingQuestion ? 'Update Question' : 'Add Question'}
        </button>
        {editingQuestion && <button onClick={resetForm}>Cancel</button>}



        {/* Import from Database Section */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <button onClick={() => setShowImportModal(true)} style={{ backgroundColor: '#007bff', color: 'white', width: '100%' }}>
            Import from Question Bank
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="import-modal" style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', padding: '20px', zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)', width: '80%', maxHeight: '80vh', overflowY: 'auto'
        }}>
          <h3>Select Questions to Import</h3>
          <button onClick={() => setShowImportModal(false)} style={{ float: 'right', background: 'red', color: 'white' }}>Close</button>

          <div style={{ marginTop: '20px' }}>
            {allQuestions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>Question</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allQuestions.map((q) => (
                    <tr key={q._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{q.questionText || q.question}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => handleImportQuestion(q)} style={{ background: '#28a745', color: 'white' }}>
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No questions found in the database.</p>
            )}
          </div>
        </div>
      )}
      {showImportModal && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowImportModal(false)}></div>}

      {/* Question List */}
      {
        questions.length > 0 && (
          <div className="question-list">
            <h3>Questions in this Exam</h3>
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question._id}>
                    <td>{question.questionText}</td>
                    <td>
                      {question.options.map((option, index) => (
                        <div key={index}>{option}</div>
                      ))}
                    </td>
                    <td>
                      <button onClick={() => handleEditQuestion(question)}>
                        <FaEdit />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `http://localhost:4000/api/delete-question/${question._id}`,
                              { method: 'DELETE' }
                            );
                            if (response.ok) {
                              alert('Question deleted successfully');
                              fetchQuestions(); // Refresh question list
                            } else {
                              alert('Failed to delete the question');
                            }
                          } catch (error) {
                            console.error('Error deleting question:', error);
                            alert('Error deleting question');
                          }
                        }}
                      >
                        <FaTrash />
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div >
  );
};

export default QuestionManagement;
