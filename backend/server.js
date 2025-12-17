import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEmails, addSampleEmails } from './routes/emails.js';
import { summarizeArticle, detectAI, generateResearchInsights } from './routes/ai.js';
import { analyzeWritingStyle, generatePersonalizedResponse } from './routes/user.js';
import { saveHistory, getHistory } from './routes/history.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is required in .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
  temperature: 0.5,
  topP: 0.8,
  topK: 30,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Email routes
app.get('/api/emails', getEmails);
app.post('/api/emails/sample', addSampleEmails);

// History routes
app.post('/api/history', saveHistory);
app.get('/api/history', getHistory);

// AI routes
app.post('/api/summarize', (req, res) => summarizeArticle(req, res, model, generationConfig));
app.post('/api/detect-ai', (req, res) => detectAI(req, res, model, generationConfig));
app.post('/api/research-insights', (req, res) => generateResearchInsights(req, res, model));

// User routes
app.post('/api/analyze-style', (req, res) => analyzeWritingStyle(req, res, model, generationConfig));
app.post('/api/generate-response', (req, res) => generatePersonalizedResponse(req, res, model, generationConfig));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database connected to Neon PostgreSQL`);
});
