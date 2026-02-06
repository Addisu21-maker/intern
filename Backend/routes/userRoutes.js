import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import SignUp from '../models/logModel.js';
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
        const plainPassword = userData.password || defaultPassword;
        // Hash if not already hashed
        let passwordToStore = plainPassword;
        if (!plainPassword.startsWith('$2b$') && !plainPassword.startsWith('$2a$')) {
          const salt = await bcrypt.genSalt(10);
          passwordToStore = await bcrypt.hash(plainPassword, salt);
        }

        usersToInsert.push({
          ...userData,
          password: passwordToStore,
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
              `Hello ${user.name},\n\nYour account has been created successfully!\n\nUser ID: ${user.userId}\nPassword: (The password you signed up with)\n\nPlease log in at the portal.\n\nBest regards,\nAdmin Team`
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

// Delete user by ID with Role Protection
router.delete('/users/delete-user/:id', async (req, res) => {
  const userId = req.params.id;
  const requesterEmail = req.headers['requester-email'];
  const isSuperAdmin = requesterEmail === 'admin@gmail.com';

  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection Logic: Only Super Admin can delete other Admins
    if (userToDelete.role === 'admin' && !isSuperAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admin can delete admin accounts.' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Delete all students (Available to all admins)
router.delete('/users/delete-all-students', async (req, res) => {
  try {
    const result = await User.deleteMany({ role: 'user' });
    res.status(200).json({ message: `${result.deletedCount} students deleted successfully` });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({ message: 'Failed to delete all students' });
  }
});

// Delete all admins (Super Admin Only)
router.delete('/users/delete-all-admins', async (req, res) => {
  const requesterEmail = req.headers['requester-email'];
  const SUPER_ADMIN_EMAIL = 'admin@gmail.com';

  if (requesterEmail !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Access Denied: Only Super Admin can delete all admins.' });
  }

  try {
    // Delete all admins EXCEPT the Super Admin themselves
    const result = await User.deleteMany({
      role: 'admin',
      email: { $ne: SUPER_ADMIN_EMAIL }
    });
    res.status(200).json({ message: `${result.deletedCount} admins deleted successfully. Super Admin account preserved.` });
  } catch (error) {
    console.error('Error deleting all admins:', error);
    res.status(500).json({ message: 'Failed to delete all admins' });
  }
});

// Edit user by ID (newly added)
router.put('/users/edit-user/:id', async (req, res) => {
  const userId = req.params.id; // This is the _id in MongoDB
  const updateData = req.body;

  try {
    // Find the user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Only update fields present in the request
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
    // Find user by userId OR email (allowing login with either)
    const user = await User.findOne({
      $or: [
        { userId: userId },
        { email: userId } // Assuming the frontend sends email/userId in the 'userId' field
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check password
    let isMatch = false;

    // If password starts with $2b$ or $2a$, it's likely a bcrypt hash
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison (legacy/default admin created)
      isMatch = (password === user.password);
    }

    if (!isMatch) {
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

    // Verify current password
    if (currentPassword) {
      let isMatch = false;
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        isMatch = await bcrypt.compare(currentPassword, user.password);
      } else {
        isMatch = (currentPassword === user.password);
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
    }

    // 1. Update the Active User
    user.password = newPassword;
    await user.save();

    // 2. Sync with the SignUp collection (so re-imports use the new password)
    await SignUp.findOneAndUpdate(
      { email: user.email },
      { password: newPassword }
      // The logModel has its own pre-save hook to hash this!
    );

    res.status(200).json({ message: 'Password updated successfully across all records' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

export default router;










