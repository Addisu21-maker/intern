import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js'; // Ensure the User model is properly exported with ES6
const router = express.Router();
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'

dotenv.config()
const secretKey = process.env.JWT_SECRET;

// Create a user
router.post('/add-user', async (req, res) => {
  const { userId, name, email, role } = req.body;


  // Hash the default password
  const defaultPassword = "qwe123";
  // const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Generate unique ID for the user
  // const userId = 'user' + Date.now();


  const newUser = new User({
    userId,
    name,
    email,
    password: defaultPassword,
    role,
    score: 0, // Default score
  });

  try {
    await newUser.save();
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

  const usersToInsert = users.map(user => ({
    ...user,
    password: defaultPassword,
    score: user.score || 0
  }));

  try {
    const result = await User.insertMany(usersToInsert, { ordered: false });
    res.status(201).json({ message: `${result.length} users registered successfully`, count: result.length });
  } catch (error) {
    console.error('Error during bulk insertion:', error);
    // If some succeeded and some failed (e.g. duplicates), Mongoose throws an error but result might still contain successes if {ordered: false}
    const insertedCount = error.insertedDocs ? error.insertedDocs.length : 0;
    res.status(500).json({
      message: 'Some users could not be registered (possibly duplicates).',
      insertedCount,
      error: error.writeErrors ? error.writeErrors.map(e => e.errmsg) : error.message
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

// Edit user by ID (newly added)
router.put('/users/edit-user/:id', async (req, res) => {
  const userId = req.params.id; // This is the _id in MongoDB
  const { name, email, role, userId: newUserId, score } = req.body; // Get updated details from the request body

  try {
    // Find the user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, userId: newUserId, score }, // Update these fields
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










