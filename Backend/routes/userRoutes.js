import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { sendEmail } from '../utils/emailService.js';
const router = express.Router();
import jwt from 'jsonwebtoken';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

dotenv.config();
const secretKey = process.env.JWT_SECRET;

// Create a user
router.post('/add-user', async (req, res) => {
  const { userId, name, email, role, sex } = req.body;

  const defaultPassword = "qwe123";

  const newUser = new User({
    userId,
    name,
    email,
    password: defaultPassword,
    role,
    sex,
    score: 0, // Default score
  });

  try {
    await newUser.save();

    // Send registration email
    await sendEmail(
      email,
      'Welcome to Quiz App - Your Credentials',
      `Hello ${name},\n\nYour account has been created successfully!\n\nUser ID: ${userId}\nPassword: ${defaultPassword}\n\nPlease log in at the portal.\n\nBest regards,\nAdmin Team`
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Bulk add users
router.post('/bulk-add-users', async (req, res) => {
  const users = req.body; // Expecting an array of user objects

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'Invalid data format. Expected an array of users.' });
  }

  const defaultPassword = "qwe123";
  let newlyAdded = 0;
  let skipped = 0;

  try {
    const usersToInsert = [];

    for (const userData of users) {
      // Check if user already exists by userId or email
      const existingUser = await User.findOne({
        $or: [{ userId: userData.userId }, { email: userData.email }]
      });

      if (existingUser) {
        skipped++;
      } else {
        usersToInsert.push({
          ...userData,
          password: defaultPassword,
          score: userData.score || 0
        });
        newlyAdded++;
      }
    }

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert, { ordered: false });

      // Send emails to newly added users in batches of 10 with throttling
      const sendBatchEmails = async () => {
        const batchSize = 10;
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
          const batch = usersToInsert.slice(i, i + batchSize);
          console.log(`Sending registration email batch ${Math.floor(i / batchSize) + 1}...`);

          await Promise.all(batch.map(user =>
            sendEmail(
              user.email,
              'Welcome to Quiz App - Your Credentials',
              `Hello ${user.name},\n\nYour account has been created successfully!\n\nUser ID: ${user.userId}\nPassword: ${defaultPassword}\n\nPlease log in at the portal.\n\nBest regards,\nAdmin Team`
            ).catch(err => console.error(`Failed to send email to ${user.email}:`, err))
          ));

          if (i + batchSize < usersToInsert.length) {
            console.log('Throttling: Waiting 2 seconds before next batch...');
            await sleep(2000);
          }
        }
        console.log('All bulk registration emails processed.');
      };

      // Run in background
      sendBatchEmails();
    }

    res.status(201).json({
      message: `${newlyAdded} users registered successfully, ${skipped} skipped (already exist).`,
      count: newlyAdded,
      skipped
    });
  } catch (error) {
    console.error('Error during bulk insertion:', error);
    res.status(500).json({
      message: 'An error occurred during bulk registration.',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Delete user by ID
router.delete('/users/delete-user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Delete all users (students only)
router.delete('/users/delete-all', async (req, res) => {
  try {
    const result = await User.deleteMany({ role: 'user' });
    res.status(200).json({ message: `${result.deletedCount} users deleted successfully` });
  } catch (error) {
    console.error('Error deleting all users:', error);
    res.status(500).json({ message: 'Failed to delete all users' });
  }
});

// Edit user by ID (newly added)
router.put('/users/edit-user/:id', async (req, res) => {
  const userId = req.params.id; // This is the _id in MongoDB
  const { name, email, role, userId: newUserId, score, sex } = req.body; // Get updated details from the request body

  try {
    // Find the user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, userId: newUserId, score, sex }, // Update these fields
      { new: true } // This ensures the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});


//check that the user is registered or not

// Login route
router.post('/users/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check password (plain text)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Return user info so frontend can store it
    res.status(200).json({
      message: 'Login successful!',
      user: {
        _id: user._id,      // For storing userId in localStorage
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

// Change password
router.put('/users/change-password/:id', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (plain text) if provided
    if (currentPassword && user.password !== currentPassword) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

export default router;










