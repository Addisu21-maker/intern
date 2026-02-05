import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import examRoutes from './routes/examRoutes.js';
import loginRoute from './routes/loginRoute.js';
import sinupRoute from './routes/sinupRoute.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import examResultRoutes from './routes/examResultRoutes.js'
import contactRoutes from './routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGODB_URI;

if (!MONGO_URL) {
  console.error('❌ Error: MONGODB_URI is not set in environment variables');
  console.error('Please create a .env file in the Backend folder with:');
  console.error('MONGODB_URI=mongodb://localhost:27017/exam_app');
  console.error('Or for MongoDB Atlas:');
  console.error('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam_app');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Make sure MongoDB is running locally (mongodb://localhost:27017)');
    console.error('2. Or update MONGODB_URI in .env file with your MongoDB Atlas connection string');
    console.error('3. Check your internet connection if using MongoDB Atlas');
    process.exit(1);
  });

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Exam App API is running!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      categories: '/api/categories',
      exams: '/api/exams',
      questions: '/api/questions',
      dashboard: '/api/dashboard-stats',
      login: '/api/users/login',
      signup: '/api/user/signup'
    }
  });
});

// Routes
app.use('/api', userRoutes); // Prefix user-related routes with `/api/users`
app.use('/api', categoryRoutes);
app.use('/api', questionRoutes);
app.use('/api', examRoutes);
app.use('/api/user', sinupRoute); // User signup routes at /api/user/register and /api/user/logging
app.use('/api', loginRoute); // User login route at /api/users/login
app.use('/api', adminAuthRoutes); // Admin auth routes at /api/register and /api/login
app.use('/api', dashboardRoutes)
app.use('/api', examResultRoutes)
app.use('/api/contact', contactRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


