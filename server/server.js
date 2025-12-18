const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require('./config/db');

// Import all route files
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();

connectDB();

const app = express();


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount all API routes
app.use('/api/auth', authRoutes); // User authentication
app.use('/api/courses', courseRoutes); // Course CRUD and details
app.use('/api/reviews', reviewRoutes); // Course reviews
app.use('/api/discussions', discussionRoutes); // Q&A discussions
app.use('/api/ai', aiRoutes); // Gemini AI relay
app.use('/api/upload', uploadRoutes); // File/video uploads

// Gemini API Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Validation
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Use the requested model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // Return JSON response
        res.json({ reply: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Better error message for debugging
        res.status(500).json({
            error: "Failed to generate response",
            details: error.message
        });
    }
});

// Root test route
app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
