const { createClient } = require('@libsql/client/web');
require('dotenv').config();

const db = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL || 'libsql://electric-bharath-0814.aws-ap-south-1.turso.io',
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc2Njk3NTcsImlkIjoiMDFhMDM5NmItYTIwMS03NzZjLWE2MTUtMDIxYjdmNWE2YjY0Iiwia2lkIjoiRmpxZDdBMVFkQUFVeHJXQkYycmFMVFZVZTJhR0pJaXRNZlN4aTlSV0NyayIsInJpZCI6IjM2MWRlYzJjLTQ4NTYtNDM5OS04Mzc2LWQ1ZDQ2ZjAxZjM3YSJ9.UIHLkobAUfH6KSRXVDepAoSJIrTKSrEW2_sgDwk24ng--44YnVbGQrVa_sC-pGfKjFUxBk7bn9OVwG-Ekc1uDA'
});

async function init() {
  console.log('Connecting to Turso...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      vehicle_model TEXT,
      battery_capacity_kwh REAL DEFAULT 60.0,
      current_battery_pct REAL DEFAULT 80.0,
      connector_type TEXT DEFAULT 'CCS2',
      range_km REAL DEFAULT 350.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      station_id TEXT,
      station_name TEXT,
      station_address TEXT,
      slot_time TEXT,
      charging_type TEXT,
      status TEXT DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      station_id TEXT,
      station_name TEXT,
      station_address TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ ALL TURSO TABLES INITIALIZED SUCCESSFULLY!');
}

init().catch(err => {
  console.error('Init DB Error:', err);
  process.exit(1);
});
