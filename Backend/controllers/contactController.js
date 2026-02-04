import ContactMessage from '../models/contactModel.js';
import { sendEmail } from '../utils/emailService.js';

// Add a new contact message
export const addContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Ensure all required fields are provided
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newContactMessage = new ContactMessage({
            name,
            email,
            message,
        });

        await newContactMessage.save();
        res.status(201).json({
            message: 'Message submitted successfully',
            contactMessage: newContactMessage
        });
    } catch (error) {
        console.error('Error submitting message:', error);
        res.status(500).json({ message: 'Error submitting message', error: error.message });
    }
};

// Get all contact messages (for administrative purposes)
export const getAllContactMessages = async (req, res) => {
    try {
        const contactMessages = await ContactMessage.find();
        res.status(200).json(contactMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// Reply to a contact message
export const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;

        if (!replyMessage) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        const contact = await ContactMessage.findById(id);

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Send email (optional - won't block DB update if settings are missing)
        let emailSent = false;
        try {
            const emailResult = await sendEmail(
                contact.email,
                'Reply to your inquiry - Quiz App',
                `Hello ${contact.name},\n\nThank you for contacting us. Regarding your message: "${contact.message}"\n\nOur response:\n${replyMessage}\n\nBest regards,\nAdmin Team`
            );
            emailSent = emailResult.success;
            if (!emailSent) {
                console.warn('⚠️ Email notification failed:', emailResult.error);
            }
        } catch (emailError) {
            console.warn('⚠️ Email service error:', emailError.message);
        }

        // Update database (this always happens so the user can see the reply on the website)
        contact.reply = replyMessage;
        contact.repliedAt = new Date();
        contact.status = 'replied';

        await contact.save();

        res.status(200).json({
            message: emailSent ? 'Reply sent and email notification delivered' : 'Reply saved successfully (Email notification failed)',
            contact,
            emailSent
        });
    } catch (error) {
        console.error('Error replying to message:', error);
        res.status(500).json({ message: 'Error replying to message', error: error.message });
    }
};

// Delete a contact message
export const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await ContactMessage.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};

// Get messages for a specific user by email
export const getUserMessages = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const messages = await ContactMessage.find({ email }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching user messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};
