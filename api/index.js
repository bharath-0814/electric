const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client/web');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration with fallback to configured Turso credentials
const TURSO_URL = process.env.VITE_TURSO_DATABASE_URL || 
                  process.env.TURSO_DATABASE_URL || 
                  'libsql://electric-bharath-0814.aws-ap-south-1.turso.io';

const TURSO_TOKEN = process.env.VITE_TURSO_AUTH_TOKEN || 
                    process.env.TURSO_AUTH_TOKEN || 
                    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc2Njk3NTcsImlkIjoiMDFhMDM5NmItYTIwMS03NzZjLWE2MTUtMDIxYjdmNWE2YjY0Iiwia2lkIjoiRmpxZDdBMVFkQUFVeHJXQkYycmFMVFZVZTJhR0pJaXRNZlN4aTlSV0NyayIsInJpZCI6IjM2MWRlYzJjLTQ4NTYtNDM5OS04Mzc2LWQ1ZDQ2ZjAxZjM3YSJ9.UIHLkobAUfH6KSRXVDepAoSJIrTKSrEW2_sgDwk24ng--44YnVbGQrVa_sC-pGfKjFUxBk7bn9OVwG-Ekc1uDA';

const TOMTOM_KEY = process.env.VITE_TOMTOM_API_KEY || 
                   process.env.TOMTOM_API_KEY || 
                   'thHtb4uWMthi8Xe1KMQ3dZLdUhaEn4NS';

function getDb() {
  return createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN
  });
}

// 1. Health check & database verification
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute('SELECT 1 as connected;');
    res.json({
      status: 'ok',
      message: 'Connected to Turso Edge SQL Database',
      dbConnected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Turso health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Turso: ' + error.message,
      dbConnected: false
    });
  }
});

// 2. User Sync (Upsert on login)
app.post(['/api/users/sync', '/users/sync'], async (req, res) => {
  try {
    const { id, email, displayName, photoUrl } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID is required' });

    const db = getDb();
    await db.execute({
      sql: `INSERT INTO users (id, email, display_name, photo_url) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            email = excluded.email, 
            display_name = excluded.display_name, 
            photo_url = excluded.photo_url;`,
      args: [id, email || '', displayName || '', photoUrl || '']
    });

    // Ensure default profile exists
    await db.execute({
      sql: `INSERT OR IGNORE INTO user_profiles (user_id, vehicle_model, battery_capacity_kwh, current_battery_pct, connector_type, range_km)
            VALUES (?, 'Tesla Model 3 / Standard EV', 60.0, 80.0, 'CCS2', 380.0);`,
      args: [id]
    });

    res.json({ success: true, message: 'User synced successfully' });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. User Profile Get / Update
app.get(['/api/profile/:userId', '/profile/:userId'], async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM user_profiles WHERE user_id = ?;',
      args: [req.params.userId]
    });

    if (result.rows.length === 0) {
      return res.json({
        user_id: req.params.userId,
        vehicle_model: 'Standard Electric Vehicle',
        battery_capacity_kwh: 60.0,
        current_battery_pct: 80.0,
        connector_type: 'CCS2',
        range_km: 350.0
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(['/api/profile', '/profile'], async (req, res) => {
  try {
    const { userId, vehicleModel, batteryCapacityKwh, currentBatteryPct, connectorType, rangeKm } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const db = getDb();
    await db.execute({
      sql: `INSERT INTO user_profiles (user_id, vehicle_model, battery_capacity_kwh, current_battery_pct, connector_type, range_km, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
            vehicle_model = excluded.vehicle_model,
            battery_capacity_kwh = excluded.battery_capacity_kwh,
            current_battery_pct = excluded.current_battery_pct,
            connector_type = excluded.connector_type,
            range_km = excluded.range_km,
            updated_at = CURRENT_TIMESTAMP;`,
      args: [
        userId,
        vehicleModel || 'Electric Vehicle',
        Number(batteryCapacityKwh) || 60.0,
        Number(currentBatteryPct) || 80.0,
        connectorType || 'CCS2',
        Number(rangeKm) || 350.0
      ]
    });

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Reservations (Bookings)
app.get(['/api/reservations/:userId', '/reservations/:userId'], async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC;',
      args: [req.params.userId]
    });
    res.json(result.rows);
  } catch (error) {
    console.error('Reservations fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(['/api/reservations', '/reservations'], async (req, res) => {
  try {
    const { id, userId, stationId, stationName, stationAddress, slotTime, chargingType } = req.body;
    if (!userId || !stationName || !slotTime) {
      return res.status(400).json({ error: 'Missing required reservation fields' });
    }

    const reservationId = id || 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO reservations (id, user_id, station_id, station_name, station_address, slot_time, charging_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED');`,
      args: [
        reservationId,
        userId,
        stationId || '',
        stationName,
        stationAddress || '',
        slotTime,
        chargingType || 'Fast DC (50 kW)'
      ]
    });

    res.json({ success: true, id: reservationId, message: 'Slot reserved successfully' });
  } catch (error) {
    console.error('Reservation create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete(['/api/reservations/:id', '/reservations/:id'], async (req, res) => {
  try {
    const db = getDb();
    await db.execute({
      sql: 'DELETE FROM reservations WHERE id = ?;',
      args: [req.params.id]
    });
    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    console.error('Reservation delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Favorites
app.get(['/api/favorites/:userId', '/favorites/:userId'], async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC;',
      args: [req.params.userId]
    });
    res.json(result.rows);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(['/api/favorites', '/favorites'], async (req, res) => {
  try {
    const { id, userId, stationId, stationName, stationAddress, latitude, longitude } = req.body;
    if (!userId || !stationName) {
      return res.status(400).json({ error: 'Missing required favorite fields' });
    }

    const favId = id || 'fav_' + Date.now();
    const db = getDb();
    await db.execute({
      sql: `INSERT OR REPLACE INTO favorites (id, user_id, station_id, station_name, station_address, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
      args: [
        favId,
        userId,
        stationId || '',
        stationName,
        stationAddress || '',
        Number(latitude) || 0,
        Number(longitude) || 0
      ]
    });

    res.json({ success: true, id: favId, message: 'Added to favorites' });
  } catch (error) {
    console.error('Favorite add error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete(['/api/favorites/:id', '/favorites/:id'], async (req, res) => {
  try {
    const db = getDb();
    await db.execute({
      sql: 'DELETE FROM favorites WHERE id = ?;',
      args: [req.params.id]
    });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Favorite remove error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. TomTom Proxy APIs (ensures key safety & seamless fallback)
app.get(['/api/stations', '/stations'], async (req, res) => {
  try {
    const { lat, lon, radius = 15000, query = 'electric vehicle station' } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    const url = `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(query)}.json?key=${TOMTOM_KEY}&lat=${lat}&lon=${lon}&radius=${radius}&limit=50&categorySet=7309`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TomTom Stations error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get(['/api/geocode', '/geocode'], async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query q is required' });

    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(q)}.json?key=${TOMTOM_KEY}&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TomTom Geocode error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(['/api/route', '/route'], async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon, currentCharge = 80, batteryCapacity = 60 } = req.body;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'Origin and destination coordinates required' });
    }

    const url = `https://api.tomtom.com/routing/1/calculateRoute/${fromLat},${fromLon}:${toLat},${toLon}/json?key=${TOMTOM_KEY}&traffic=true&travelMode=car&vehicleEngineType=electric&currentChargeInkWh=${(currentCharge/100)*batteryCapacity}&maxChargeInkWh=${batteryCapacity}&computeTravelTimeFor=all`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TomTom Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post(['/api/range', '/range'], async (req, res) => {
  try {
    const { lat, lon, budgetInMeters = 50000, energyBudgetInkWh = 30 } = req.body;
    const url = `https://api.tomtom.com/routing/1/calculateReachableRange/${lat},${lon}/json?key=${TOMTOM_KEY}&distanceBudgetInMeters=${budgetInMeters}&travelMode=car&vehicleEngineType=electric`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('TomTom Range error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
