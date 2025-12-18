// server/routes/chat.js
const express = require("express");
// const fetch = require("node-fetch"); // Using global fetch (Node 18+)
const router = express.Router();

/**
 * POST /api/chat
 * Proxies chat requests to Google Gemini API.
 * Expects JSON body: { prompt: "user query" }
 * Returns JSON: { reply: "AI response" }
 */
router.post("/", async (req, res) => {
  try {
    console.log('[chat] incoming request', { path: req.path, body: req.body ? '[body]' : '[no-body]' }); // Logs incoming chat traffic for verification
    // Extract prompt from request body
    const { prompt } = req.body;

    // Validate prompt existence and type
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Retrieve API key from environment variables
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log('[chat] missing GEMINI_API_KEY');
      return res.status(503).json({ error: "GEMINI_API_KEY not configured" }); // Ensure client knows to configure the env var
    }

    // Google Gemini REST call (v1beta example)
    // Construct the API URL with the key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    // Construct the request body for Gemini API
    // We use a simple "parts" structure compatible with the API
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // Make the request to Google Gemini
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // Parse the response
    const data = await r.json();

    // Best-effort extraction of the reply text from the complex response structure
    // Handles various potential response formats
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || data?.output?.[0]?.content
      || data?.choices?.[0]?.message?.content
      || data?.response
      || "Sorry — I couldn't get an answer. Try again.";

    // Send the reply back to the client
    return res.json({ reply });
  } catch (err) {
    // Log error securely (avoid logging sensitive data if possible) and return 500
    console.error("chat proxy error:", err?.message || err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
