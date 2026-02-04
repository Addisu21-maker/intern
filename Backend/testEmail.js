import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('--- Email Configuration Diagnostic ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER === 'your-email@gmail.com' ? '❌ Still placeholder' : '✅ Looks like an actual email');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS === 'your-app-specific-password' ? '❌ Still placeholder' : '✅ Looks like a password is set');
console.log('--------------------------------------');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log('Testing connection to Gmail...');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Connection Error:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('TIP: If using Gmail, you MUST use an "App Password", not your regular password.');
        }
    } else {
        console.log('✅ Server is ready to take our messages!');
    }
    process.exit();
});
