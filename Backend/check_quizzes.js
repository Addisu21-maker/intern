
import mongoose from 'mongoose';
import Quiz from './models/quizModel.js';
import dotenv from 'dotenv';

dotenv.config();

import Exam from './models/examModel.js';

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz_app');
        console.log('Connected to DB');

        const quizzes = await Quiz.find({});
        console.log(`Found ${quizzes.length} quizzes in 'quizzes' collection.`);
        quizzes.forEach(q => console.log(`- Quiz: ${q.quizName}`));

        const exams = await Exam.find({});
        console.log(`Found ${exams.length} exams in 'exams' collection.`);
        exams.forEach(e => console.log(`- Exam Keys:`, Object.keys(e.toObject()), `Data:`, e));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkDB();
