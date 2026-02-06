import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SignUp from './models/logModel.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URL = process.env.MONGODB_URI;

if (!MONGO_URL) {
    console.error('MONGO_URL not found in .env');
    process.exit(1);
}

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to DB');

        const email = 'admin@gmail.com';
        const password = 'admin'; // Specific password requested by user context implies simplicity usually, but I'll set a standard one. 
        // Actually, user asked "where can i find", implies they expect one. I will create a standard one.

        const existingAdmin = await SignUp.findOne({ email });
        if (existingAdmin) {
            console.log(`Admin already exists. Email: ${email}`);
            return;
        }

        const admin = new SignUp({
            name: 'Super Admin',
            sex: 'Male',
            email,
            password,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();
