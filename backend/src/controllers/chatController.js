import { GoogleGenerativeAI } from '@google/generative-ai';
import Conversation from '../models/Conversation.js';

// Initialize Gemini AI Client
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// @desc    Ask a question to AI and store in database
// @route   POST /api/chat
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question cannot be empty' });
    }

    let answer = '';

    // Check if GEMINI_API_KEY is set. If not, use a premium-looking fallback for testing.
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. Operating in fallback demonstration mode.');
      answer = `Hello! This is an AI-powered FAQ Assistant. I'm currently running in demo mode because the GEMINI_API_KEY is not set in the backend \`.env\` file. 

To enable live AI answers:
1. Create/edit the \`backend/.env\` file.
2. Add your Gemini API key: \`GEMINI_API_KEY=your_actual_api_key\`
3. Restart the server.

For now, here is a mock response to your question: "${question}" - The system works end-to-end and has recorded this conversation in MongoDB!`;
    } else {
      try {
        const ai = getAIClient();
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: question }] }],
        });
        answer = result.response.text;
      } catch (aiError) {
        console.warn('Gemini API Error. Falling back to demonstration response. Error:', aiError.message);
        answer = `🤖 [AI Demo Assistant]
I received your question: "${question}"

Currently, the live Gemini API service returned an error: "${aiError.message}". 
I have automatically generated this fallback response so you can test the database search and history list. This entire conversation has been successfully stored in your MongoDB Atlas cloud database!`;
      }
    }

    // Save to Database
    const conversation = await Conversation.create({
      question: question.trim(),
      answer,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Server Error in askQuestion:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// @desc    Get previous conversation history
// @route   GET /api/history
export const getHistory = async (req, res) => {
  try {
    const history = await Conversation.find({}).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Server Error in getHistory:', error);
    res.status(500).json({ message: 'Failed to retrieve history', error: error.message });
  }
};

// @desc    Search previous conversations
// @route   GET /api/search
export const searchHistory = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query parameter (q) is required' });
    }

    // Search using MongoDB regex for flexible partial matching
    const results = await Conversation.find({
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { answer: { $regex: q, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    console.error('Server Error in searchHistory:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// @desc    Delete a conversation by ID
// @route   DELETE /api/chat/:id
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndDelete(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Server Error in deleteConversation:', error);
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
};
