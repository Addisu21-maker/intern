import ContactMessage from '../models/contactModel.js';
import User from '../models/userModel.js';
import { sendEmail } from '../utils/emailService.js';

// Add a new contact message
export const addContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Ensure all required fields are provided
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify if the email belongs to a registered user or admin (or the hardcoded Super Admin)
        const isSuperAdmin = email.toLowerCase() === 'admin@gmail.com';
        const verifiedUser = await User.findOne({ email: email.toLowerCase() });

        if (!verifiedUser && !isSuperAdmin) {
            return res.status(403).json({
                message: 'Access Denied. Only registered users and admins can send messages.'
            });
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

// Get all contact messages (enriched with sender roles)
export const getAllContactMessages = async (req, res) => {
    try {
        const contactMessages = await ContactMessage.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: { contactEmail: { $toLower: "$email" } },
                    pipeline: [
                        { $match: { $expr: { $eq: [{ $toLower: "$email" }, "$$contactEmail"] } } }
                    ],
                    as: 'senderInfo'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    message: 1,
                    createdAt: 1,
                    reply: 1,
                    repliedAt: 1,
                    status: 1,
                    senderRole: { $arrayElemAt: ["$senderInfo.role", 0] }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        // Post-process for hardcoded Super Admin and defaults
        const enrichedMessages = contactMessages.map(msg => {
            const emailLower = msg.email.toLowerCase();
            let role = msg.senderRole;

            if (emailLower === 'admin@gmail.com') {
                role = 'admin';
            } else if (!role) {
                role = 'user'; // Default to user for non-admin senders
            }

            return { ...msg, senderRole: role };
        });

        res.status(200).json(enrichedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// Reply to a contact message
export const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage, repliedBy } = req.body;

        if (!replyMessage) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        const contact = await ContactMessage.findById(id);

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Send email (optional)
        let emailSent = false;
        try {
            const emailResult = await sendEmail(
                contact.email,
                'Reply to your inquiry - Quiz App',
                `Hello ${contact.name},\n\nThank you for contacting us. Regarding your message: "${contact.message}"\n\nOur response:\n${replyMessage}\n\nBest regards,\nAdmin Team`
            );
            emailSent = emailResult.success;
        } catch (emailError) {
            console.warn('⚠️ Email service error:', emailError.message);
        }

        contact.reply = replyMessage;
        contact.repliedAt = new Date();
        contact.status = 'replied';
        contact.repliedBy = repliedBy || 'Admin';
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
        if (!deletedMessage) return res.status(404).json({ message: 'Message not found' });
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};

// Get messages for a specific user by email
export const getUserMessages = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const messages = await ContactMessage.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// Get count of pending messages (Filtered by requester)
export const getPendingMessageCount = async (req, res) => {
    try {
        const { email } = req.query;
        const isSuperAdmin = email === 'admin@gmail.com';

        if (isSuperAdmin) {
            // Super Admin sees all pending messages
            const count = await ContactMessage.countDocuments({ status: 'pending' });
            return res.status(200).json({ count });
        }

        // For Standard Admins:
        // We only want to count pending messages from regular 'users'
        // Join with User table to identify sender roles
        const pendingUserMessages = await ContactMessage.aggregate([
            { $match: { status: 'pending' } },
            {
                $lookup: {
                    from: 'users',
                    let: { contactEmail: { $toLower: "$email" } },
                    pipeline: [
                        { $match: { $expr: { $eq: [{ $toLower: "$email" }, "$$contactEmail"] } } }
                    ],
                    as: 'senderInfo'
                }
            },
            {
                $project: {
                    senderRole: { $arrayElemAt: ["$senderInfo.role", 0] },
                    email: 1
                }
            },
            {
                $match: {
                    $or: [
                        { senderRole: 'user' },
                        { senderRole: { $exists: false } } // Default to user
                    ]
                }
            },
            { $count: "count" }
        ]);

        const count = pendingUserMessages.length > 0 ? pendingUserMessages[0].count : 0;
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching message count:', error);
        res.status(500).json({ message: 'Error fetching message count', error: error.message });
    }
};

// Mark a message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const { seenBy } = req.body;
        const contact = await ContactMessage.findById(id);

        if (!contact) return res.status(404).json({ message: 'Message not found' });

        if (contact.status === 'pending') {
            contact.status = 'seen';
            contact.seenBy = seenBy || 'Admin';
            await contact.save();
        }

        res.status(200).json({ message: 'Message marked as seen', contact });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
