import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SignUp from '../models/logModel.js';
import User from '../models/userModel.js';

const router = express.Router();
const JWT_SECRET = 'hailemeskelMierafLidia122116';

// Admin signup route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const existingUser = await SignUp.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

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
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 1. Check in the SignUp collection (Traditional Admin)
        let admin = await SignUp.findOne({ email });
        let isPasswordValid = false;
        let userData = null;

        if (admin) {
            isPasswordValid = await admin.comparePassword(password);
            if (isPasswordValid) {
                userData = { email: admin.email, role: admin.role, id: admin._id };
            }
        }

        // 2. If not found or invalid in SignUp, check in the User collection (Created via User Management)
        if (!userData) {
            const user = await User.findOne({ email, role: 'admin' });
            if (user && user.password === password) {
                isPasswordValid = true;
                userData = { email: user.email, role: user.role, id: user._id };
            }
        }

        if (!userData || !isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials or not an admin.' });
        }

        // Generate a JWT
        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            token,
            message: 'Login successful!',
            user: {
                email: userData.email,
                role: userData.role
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

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
