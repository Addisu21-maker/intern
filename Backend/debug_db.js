import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/questionModel.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz_app';
console.log('Connecting to:', uri);

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const count = await Question.countDocuments();
            console.log(`Question count in '${Question.collection.name}' collection:`, count);

            const sample = await Question.find().limit(1);
            console.log('Sample question:', sample);
        } catch (err) {
            console.error('Error querying:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
    });
