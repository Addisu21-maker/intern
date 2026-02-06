import React, { useState } from 'react';
import '../styles/modal.css';

const BulkQuestionModal = ({ setShowModal, fetchQuestions, examId }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const result = [];
        // Expected headers: questionText, option1, option2, option3, option4, correctAnswer
        const headers = lines[0].split(',').map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            // Handle commas inside quotes if needed, but for simplicity we split by comma
            // Standard CSV split: currentline = lines[i].split(',');
            // More robust regex for CSV split (handles quotes):
            const currentline = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',').map(c => c.trim());

            if (currentline.length < 6) continue;

            const questionText = currentline[0].replace(/^"|"$/g, '');
            const options = [
                currentline[1].replace(/^"|"$/g, ''),
                currentline[2].replace(/^"|"$/g, ''),
                currentline[3].replace(/^"|"$/g, ''),
                currentline[4].replace(/^"|"$/g, '')
            ];
            const correctAnswer = currentline[5].replace(/^"|"$/g, '');

            result.push({
                questionText,
                options,
                correctAnswer
            });
        }
        return result;
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        if (!examId) {
            setError('Please first select an Exam from the dropdown on the management page.');
            return;
        }

        setLoading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const questions = parseCSV(text);

                if (questions.length === 0) {
                    setError('No valid questions found in the CSV file.');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:4000/api/upload-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ examId, questions }),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess(`${questions.length} questions uploaded successfully!`);
                    setTimeout(() => {
                        fetchQuestions();
                        setShowModal(false);
                    }, 2000);
                } else {
                    setError(data.message || 'Failed to upload questions.');
                }
            } catch (err) {
                setError('Error parsing or uploading file.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Bulk Question Import</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                    Upload a CSV file with 6 columns: <br />
                    <b>questionText, option1, option2, option3, option4, correctAnswer</b>
                </p>

                <div className="input-group">
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                {success && <p className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

                <div className="modal-buttons">
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="add-btn"
                        style={{ backgroundColor: '#10b981' }}
                    >
                        {loading ? 'Uploading...' : 'Upload Questions'}
                    </button>
                    <button
                        onClick={() => setShowModal(false)}
                        className="close-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1100;
                }
                .modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }
                .input-group {
                    margin-bottom: 20px;
                }
                .input-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .add-btn, .close-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .close-btn {
                    background: #eee;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default BulkQuestionModal;
