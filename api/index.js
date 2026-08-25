const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Turso (LibSQL) Connection
const db = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL || '',
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || '',
});

// Basic route to test Turso connection
app.get('/api/health', async (req, res) => {
  try {
    // A simple query to verify the database connection
    await db.execute('SELECT 1;');
    res.json({ status: 'ok', message: 'Connected to Turso Edge SQL Database!' });
  } catch (error) {
    console.error('Turso connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to Turso.' });
  }
});

// Export the Express API for Vercel Serverless Functions
module.exports = app;
