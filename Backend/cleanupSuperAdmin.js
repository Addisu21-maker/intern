import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SignUp from './models/logModel.js';
import User from './models/userModel.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URL = process.env.MONGODB_URI;

const cleanupSuperAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        const email = 'admin@gmail.com';

        const signupResult = await SignUp.deleteMany({ email });
        const userResult = await User.deleteMany({ email });

        console.log(`Removed ${signupResult.deletedCount} entries from SignUp`);
        console.log(`Removed ${userResult.deletedCount} entries from User`);
        console.log('Super Admin cleanup complete.');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
    }
};

cleanupSuperAdmin();
