import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SignUp from '../models/logModel.js';

const router = express.Router();
const JWT_SECRET = 'hailemeskelMierafLidia122116';

// Admin signup route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check if the user already exists
        const existingUser = await SignUp.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Create a new admin user
        const user = new SignUp({ email, password, role: 'admin' });
        await user.save();

        return res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        console.error('Admin signup error:', error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Admin login route
router.post('/login', async (req, res) => {
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
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            token,
            message: 'Login successful!',
            user: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Admin change password
router.put('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await SignUp.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password.' });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;

