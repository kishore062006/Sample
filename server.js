import { GoogleGenAI } from "@google/genai";
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { getDb } from './db.js'; // Import the database function

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the .env file!");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash"; // Fast and capable model

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- DATABASE CONNECTION & SERVER START ---
async function startServer() {
    // Initialize DB connection first
    await getDb(); 

    // --- 1. GEMINI AI CHAT ROUTE ---
    app.post('/api/chat', async (req, res) => {
        const userPrompt = req.body.prompt;
        
        if (!userPrompt) {
            return res.status(400).send({ error: 'Missing prompt in request body' });
        }

        const systemInstruction = "You are Sustaina-Bot, a helpful assistant specializing in eco-friendly material alternatives, sustainable processes, and green innovation ideas. Keep answers concise and encouraging, and always relate the answer back to sustainability or innovation.";

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            res.json({ text: response.text });

        } catch (error) {
            console.error('Gemini API Error:', error);
            res.status(500).send({ error: 'Failed to communicate with the AI model.' });
        }
    });

    // --- 2. IDEA SUBMISSION ROUTE (Saves to SQLite) ---
    app.post('/api/submit-idea', async (req, res) => {
        const { title, category, description, impactMetric, submitterName, submitterEmail } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields (Title, Category, Description).' });
        }

        try {
            const db = await getDb();
            const result = await db.run(
                `INSERT INTO ideas (title, category, description, impact_metric, submitter_name, submitter_email) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [title, category, description, impactMetric, submitterName, submitterEmail]
            );

            res.status(201).json({ 
                success: true, 
                message: 'Idea submitted successfully!',
                id: result.lastID 
            });

        } catch (error) {
            console.error('Database Submission Error:', error);
            res.status(500).json({ success: false, message: 'Internal server error while saving idea.' });
        }
    });


    // Start Express listener
    app.listen(PORT, () => {
        console.log(`🚀 Backend server listening at http://localhost:${PORT}`);
    });
}

startServer();