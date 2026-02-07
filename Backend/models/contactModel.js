import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reply: {
    type: String,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'seen', 'replied'],
    default: 'pending'
  },
  repliedBy: {
    type: String,
    default: null
  },
  seenBy: {
    type: String,
    default: null
  }
});

const ContactMessage = mongoose.model('ContactMessage', contactSchema);
export default ContactMessage;
