import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { askQuestion, getHistory, searchHistory, deleteConversation } from './controllers/chatController.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/chat', askQuestion);
app.get('/api/history', getHistory);
app.get('/api/search', searchHistory);
app.delete('/api/chat/:id', deleteConversation);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FAQ Assistant Backend is running' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
