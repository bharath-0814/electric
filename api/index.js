const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vanilla JS + MEN Stack Backend is running on Vercel!' });
});

// Export the Express API for Vercel Serverless Functions
module.exports = app;
