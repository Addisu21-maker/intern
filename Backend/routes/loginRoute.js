import express from 'express';
import User from '../models/userModel.js';
const router = express.Router();

// Login Route (plain text password)
router.post('/users/login', async (req, res) => {
    const { userId, password } = req.body;  // frontend sends { userId, password }

    try {
        // Find user by userId
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Return user info including _id so frontend can store it
        res.status(200).json({
            message: 'Login successful!',
            user: {
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;
