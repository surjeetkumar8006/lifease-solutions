import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  }
);

// Create indexes for efficient text searching across question and answer
conversationSchema.index({ question: 'text', answer: 'text' });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
