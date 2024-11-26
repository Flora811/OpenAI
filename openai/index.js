// Import required modules
const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const markdownIt = require('markdown-it');
const openai = require('openai');

// Load environment variables
dotenv.config();

// Initialize the OpenAI API
const openAiClient = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Use the key stored in your .env
  organization: process.env.OPENAI_ORG_KEY,  // Optionally use an organization key if needed
});

// Set up rate limiter for OpenAI API calls (rate limiting 5 requests per minute)
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,  // seconds
});

const app = express();
const port = 3000;

// Middleware
app.use(helmet()); // Enhance security
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.static('public')); // Serve static files (CSS, JS, HTML)
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)  // Rate limit based on the IP address
    .then(() => next())
    .catch(() => res.status(429).send('Too many requests, please try again later.'));
});

// Serve HTML page for the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Chatbot endpoint with input validation and rate limiting
app.post('/chat', [
  body('message').trim().isLength({ min: 1 }).escape().withMessage('Message is required and should not be empty.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userMessage = req.body.message;

  try {
    // Call the OpenAI API with rate limiting
    const openAiResponse = await openAiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    const chatbotReply = openAiResponse.choices[0].message.content;

    // Optionally, render Markdown content to HTML
    const md = markdownIt();
    const formattedReply = md.render(chatbotReply);

    res.send({ reply: formattedReply });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Something went wrong!' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${3000}`);
});
