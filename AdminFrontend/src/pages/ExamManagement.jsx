import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import '../styles/ExamManagement.css';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [examName, setExamName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [totalTime, setTotalTime] = useState(30);
  const [passcode, setPasscode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editExamId, setEditExamId] = useState('');

  // Fetch existing exams
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

  // Handle exam creation
  const handleCreateExam = async () => {
    const data = { examName, categories: [selectedCategory], totalTime, passcode };
    try {
      const response = await fetch('http://localhost:4000/api/create-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Exam added successfully');
        fetchExams();
        setExamName('');
        setSelectedCategory('');
        setTotalTime(30);
        setPasscode('');
      } else {
        const errorData = await response.json();
        alert(`Failed to create exam: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Error creating exam');
    }
  };

  // Handle exam deletion
  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/delete-exam/${examId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Exam deleted successfully');
        fetchExams();
      } else {
        alert('Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Error deleting exam');
    }
  };

  // Handle exam editing
  const handleEditExam = async () => {
    const data = { examName, categories: [selectedCategory], totalTime, passcode };
    try {
      const response = await fetch(`http://localhost:4000/api/edit-exam/${editExamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Exam updated successfully');
        fetchExams();
        setIsEditing(false);
        setEditExamId('');
        setExamName('');
        setSelectedCategory('');
        setTotalTime(30);
        setPasscode('');
      } else {
        const errorData = await response.json();
        alert(`Failed to update exam: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Error updating exam');
    }
  };

  // Update selected category
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Get category names based on IDs
  const getCategoryNames = (categories) => {
    return categories.map((category) => category.name).join(', ');
  };

  useEffect(() => {
    fetchExams();
    fetchCategories();
  }, []);

  return (
    <div className="quiz-management">
      <h2>Exam Management</h2>



      {/* Create Exam Form */}
      <div className="create-quiz">
        <TextField
          label="Exam Name"
          variant="outlined"
          fullWidth
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            renderValue={(selected) => {
              const category = categories.find((cat) => cat._id === selected);
              return category ? category.name : 'Select a Category';
            }}
          >
            {categories.length === 0 ? (
              <MenuItem value="" disabled>
                Loading categories...
              </MenuItem>
            ) : (
              categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <TextField
          label="Total Exam Time (minutes)"
          variant="outlined"
          fullWidth
          type="number"
          value={totalTime}
          onChange={(e) => setTotalTime(e.target.value)}
          margin="normal"
        />

        <TextField
          label="Passcode"
          variant="outlined"
          fullWidth
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          margin="normal"
        />


        <Button
          variant="contained"
          color="primary"
          onClick={isEditing ? handleEditExam : handleCreateExam}
          fullWidth
        >
          {isEditing ? 'Update Exam' : 'Create Exam'}
        </Button>
      </div>

      {/* Exam List */}
      <div className="quiz-list">
        <h3>Existing Exams</h3>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Total Time</TableCell>
                <TableCell>Passcode</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>{exam.examName}</TableCell>
                    <TableCell>{getCategoryNames(exam.categories)}</TableCell>
                    <TableCell>{exam.totalTime} minutes</TableCell>
                    <TableCell>{exam.passcode}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setIsEditing(true);
                          setEditExamId(exam._id);
                          setExamName(exam.examName);
                          setSelectedCategory(exam.categories[0]._id);
                          setTotalTime(exam.totalTime);
                          setPasscode(exam.passcode);
                        }}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteExam(exam._id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" align="center">
                    No exams available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ExamManagement;