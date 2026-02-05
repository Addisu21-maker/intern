import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Importing jsonwebtoken to generate JWT
import SignUp from '../models/logModel.js'; // Import the SignUp model

const router = express.Router();
const JWT_SECRET = 'hailemeskelMierafLidia122116';

// Sign up route
router.post('/register', async (req, res) => {
    const { name, sex, email, password } = req.body;

    try {
        // Check if the name, email and password are provided
        if (!name || !email || !password || !sex) {
            return res.status(400).json({ message: 'Name, Sex, Email and password are required.' });
        }

        // Check if the user already exists
        const existingUser = await SignUp.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Create a new user
        const user = new SignUp({ name, sex, email, password });
        await user.save();

        return res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Login route
router.post('/logging', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check if the user exists
        const user = await SignUp.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate a JWT
        const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: '1h' } // Expiration time for the token
        );

        return res.status(200).json({ token, message: 'Login successful!' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Get all signups
router.get('/signups', async (req, res) => {
    try {
        const signups = await SignUp.find();
        res.status(200).json(signups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching signups', error: error.message });
    }
});

// Admin change password
router.put('/admin/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        const admin = await SignUp.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid current password.' });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error("Admin pw change error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
