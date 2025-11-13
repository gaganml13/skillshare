// AI Controller: Secure relay for Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load Gemini API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Relay prompt to Gemini API
 * @route POST /api/ai/generate
 */
exports.generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required.' });
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    res.json({ result: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: 'Gemini API error', error: err.message });
  }
};
