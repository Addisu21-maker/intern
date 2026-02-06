import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaFileUpload } from 'react-icons/fa';
import '../styles/QuestionManagement.css';
import BulkQuestionModal from '../components/BulkQuestionModal';

const QuestionManagement = () => {
  const [exams, setExams] = useState([]); // For exams
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showBulkModal, setShowBulkModal] = useState(false);



  const fetchQuestions = async () => {
    if (!selectedExamId) {
      setQuestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/questions/${selectedExamId}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
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
      alert('Please select an exam first.');
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

  const handleDeleteAllQuestions = async () => {
    if (!selectedExamId) {
      alert('Please select an exam first.');
      return;
    }

    if (!window.confirm("Are you sure you want to delete ALL questions for this exam? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/delete-all-questions/${selectedExamId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('All questions deleted successfully');
        fetchQuestions();
      } else {
        alert('Failed to delete all questions');
      }
    } catch (error) {
      console.error('Error deleting all questions:', error);
      alert('Error deleting all questions');
    }
  };

  useEffect(() => {
    fetchQuestions(); // Refresh question list when the selected exam filter changes
  }, [selectedExamId]);

  return (
    <div className="question-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Manage Questions</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaFileUpload />
            Bulk Import (CSV)
          </button>
          <button
            onClick={handleDeleteAllQuestions}
            style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Delete All Questions
          </button>
        </div>
      </div>

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

      </div>



      {/* Bulk Import Modal */}
      {showBulkModal && (
        <BulkQuestionModal
          setShowModal={setShowBulkModal}
          fetchQuestions={fetchQuestions}
          examId={selectedExamId}
        />
      )}

      {/* Question List */}
      {
        questions.length > 0 && (
          <div className="question-list">
            <h3 style={{ color: '#374151', marginBottom: '15px' }}>
              Questions for: <span style={{ color: '#10b981' }}>{exams.find(e => e._id === selectedExamId)?.examName}</span>
              {exams.find(e => e._id === selectedExamId)?.categories?.[0]?.name && (
                <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: '10px' }}>
                  (Category: {exams.find(e => e._id === selectedExamId)?.categories?.[0]?.name})
                </span>
              )}
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Category</th>
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
                      <span className="category-badge">{question.category || 'Uncategorized'}</span>
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
