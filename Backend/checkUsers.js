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

mongoose.connect(MONGO_URL)
    .then(async () => {
        console.log('Connected to DB');
        try {
            const users = await SignUp.find({});
            if (users.length === 0) {
                console.log('No users found in database.');
            } else {
                console.log('Users found:');
                users.forEach(u => {
                    console.log(`- Email: ${u.email}, Role: ${u.role}`);
                });
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });
