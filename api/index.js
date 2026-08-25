const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client/web'); // Use web client for Vercel Serverless
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route to test Turso connection
app.get('/api/health', async (req, res) => {
  try {
    const url = process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
    const authToken = process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      return res.status(500).json({ status: 'error', message: 'Missing Turso Database URL in Vercel Env Variables.' });
    }

    const db = createClient({ url, authToken });
    
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
