const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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

// Root test route
app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
