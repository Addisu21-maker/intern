import express from 'express';
import {
    addContactMessage,
    getAllContactMessages,
    replyToMessage,
    deleteContactMessage,
    getUserMessages,
    getPendingMessageCount,
    markMessageAsSeen
} from '../controllers/contactController.js';

const router = express.Router();

// Route to submit a contact message
router.post('/submit', addContactMessage);

// Route to get all contact messages
router.get('/all', getAllContactMessages);

// Route to reply to a contact message
router.post('/reply/:id', replyToMessage);

// Route to mark a message as seen
router.patch('/seen/:id', markMessageAsSeen);

// Route to delete a contact message
router.delete('/:id', deleteContactMessage);

// Route to get unread message count
router.get('/pending-count', getPendingMessageCount);

// Route for user to fetch their own messages
router.get('/user/:email', getUserMessages);

export default router;
