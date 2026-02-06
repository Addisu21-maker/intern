import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SignUp from '../models/logModel.js';
import User from '../models/userModel.js';

const router = express.Router();
const JWT_SECRET = 'hailemeskelMierafLidia122116';

// Admin signup route
router.post('/register', async (req, res) => {
    const { name, password, sex } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    try {
        if (!name || !email || !password || !sex) {
            return res.status(400).json({ message: 'Name, Email, Password and Sex are required.' });
        }

        const existingUser = await SignUp.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const user = new SignUp({ name, email, password, sex, role: 'admin' });
        await user.save();

        return res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        console.error('Admin signup error:', error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Explicit Add Admin route (from dashboard)
router.post('/add-admin', async (req, res) => {
    const { name, password, sex } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    try {
        if (!name || !email || !password || !sex) {
            return res.status(400).json({ message: 'Name, Email, Password and Sex are required.' });
        }

        const existingInSignUp = await SignUp.findOne({ email });
        const existingInUser = await User.findOne({ email });

        if (existingInUser) {
            return res.status(400).json({ message: 'Admin with this email already exists.' });
        }

        // 1. Add/Update SignUp (Record keeping)
        if (!existingInSignUp) {
            const signupAdmin = new SignUp({ name, email, password, sex, role: 'admin' });
            await signupAdmin.save();
        }

        // 2. Add to User (Active/Approved)
        const activeAdmin = new User({
            userId: 'ADM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            name,
            email,
            password,
            sex,
            role: 'admin'
        });
        await activeAdmin.save();

        res.status(201).json({ message: 'Admin added and approved successfully!' });
    } catch (err) {
        console.error("Add Admin Error:", err);
        res.status(500).json({ message: 'Error adding admin.' });
    }
});

// Admin login route
router.post('/login', async (req, res) => {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const SUPER_ADMIN_EMAIL = 'admin@gmail.com';
        const SUPER_ADMIN_PASSWORD = 'admin'; // Hardcoded password

        // Fast path for Super Admin - Code-based only
        if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
            console.log(`Success: Super Admin logged in via code credentials.`);
            const token = jwt.sign(
                { id: 'SUPER_ADMIN_CODE_ID', email: SUPER_ADMIN_EMAIL, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                token,
                message: 'Login successful!',
                user: {
                    email: SUPER_ADMIN_EMAIL,
                    role: 'admin'
                }
            });
        }

        // 1. Check in the SignUp collection (Temporary record for approval)
        let signupRecord = await SignUp.findOne({ email });

        // 2. Check in the User collection (Active/Approved Admins)
        let activeAdmin = await User.findOne({ email, role: 'admin' });

        // Approval Logic for other admins
        if (!activeAdmin) {
            if (signupRecord) {
                // Standard admin signed up but Super Admin hasn't added them to the active list yet
                return res.status(403).json({ message: 'Access denied. Please wait for Super Admin approval.' });
            } else {
                // Not found at all or not approved
                return res.status(401).json({ message: 'Access denied or invalid credentials.' });
            }
        }

        let userData = null;
        let isPasswordValid = false;

        if (activeAdmin) {
            // Check the active record (hashing is via bcrypt in pre-save)
            isPasswordValid = await bcrypt.compare(password, activeAdmin.password);
            if (isPasswordValid) {
                userData = { email: activeAdmin.email, role: 'admin', id: activeAdmin._id };
            }
        }

        if (!userData || !isPasswordValid) {
            console.log(`Failed login attempt for: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials or access denied.' });
        }

        // Generate a JWT for other admins
        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`Success: Admin ${email} logged in.`);
        return res.status(200).json({
            token,
            message: 'Login successful!',
            user: {
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('CRITICAL: Admin login error:', error);
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

        if (email.toLowerCase() === 'admin@gmail.com') {
            return res.status(403).json({ message: 'Super Admin credentials are managed in code and cannot be changed here.' });
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

// Admin update profile (name)
router.put('/admin/update-profile', async (req, res) => {
    const { email, name } = req.body;

    try {
        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required.' });
        }

        if (email.toLowerCase() === 'admin@gmail.com') {
            return res.status(403).json({ message: 'Super Admin profile is managed in code and cannot be updated here.' });
        }

        const user = await SignUp.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        user.name = name;
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
