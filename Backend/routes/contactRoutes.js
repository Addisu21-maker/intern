import express from 'express';
import { addContactMessage, getAllContactMessages, replyToMessage, deleteContactMessage, getUserMessages } from '../controllers/contactController.js';

const router = express.Router();

// Route to submit a contact message
router.post('/submit', addContactMessage);

// Route to get all contact messages
router.get('/all', getAllContactMessages);

// Route to reply to a contact message
router.post('/reply/:id', replyToMessage);

// Route to delete a contact message
router.delete('/:id', deleteContactMessage);

// Route for user to fetch their own messages
router.get('/user/:email', getUserMessages);

export default router;
