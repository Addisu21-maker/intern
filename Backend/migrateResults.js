import mongoose from 'mongoose';
import ExamResult from './models/examResultModel.js';
import User from './models/userModel.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URL = process.env.MONGODB_URI;

const migrate = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to DB');

        const results = await ExamResult.find({ userEmail: { $exists: false } });
        console.log(`Found ${results.length} results to migrate`);

        for (const res of results) {
            const user = await User.findById(res.userId);
            if (user) {
                res.userEmail = user.email;
                await res.save();
                console.log(`Migrated result for user: ${user.email}`);
            } else {
                console.log(`User not found for result ${res._id}, cannot migrate email.`);
                // If user is deleted, we might not be able to recover the email easily 
                // unless we look at the SignUp collection as a fallback.
                const signup = await mongoose.connection.db.collection('signups').findOne({ role: 'user' }); // This is generic, not helpful
                // Better approach: look at the populate logic used in dashboard
            }
        }

        console.log('Migration complete');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        mongoose.disconnect();
    }
};

migrate();
