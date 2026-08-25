-- Evora Database Schema for Turso SQL (LibSQL / SQLite)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  vehicle_model TEXT,
  battery_capacity_kwh REAL DEFAULT 60.0,
  preferred_connector TEXT DEFAULT 'CCS2',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stations Table
CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  operator TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  total_ports INTEGER NOT NULL DEFAULT 4,
  available_ports INTEGER NOT NULL DEFAULT 4,
  max_power_kw REAL NOT NULL DEFAULT 150.0,
  connectors_json TEXT NOT NULL,
  pricing_per_kwh REAL NOT NULL DEFAULT 0.35,
  currency TEXT DEFAULT 'USD',
  rating REAL DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 0,
  amenities_json TEXT,
  status TEXT DEFAULT 'available',
  is_evora_hub INTEGER DEFAULT 0,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Slot Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  station_address TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  port_number INTEGER NOT NULL,
  connector_type TEXT NOT NULL,
  power_kw REAL NOT NULL,
  start_time DATETIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_cost REAL NOT NULL,
  status TEXT DEFAULT 'confirmed',
  qr_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations (id)
);

-- User Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations (id)
);

-- Saved Favorite Stations Table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  station_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_email, station_id),
  FOREIGN KEY (station_id) REFERENCES stations (id)
);

-- Indexes for high-performance geo-queries
CREATE INDEX IF NOT EXISTS idx_stations_coords ON stations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations (user_email);
CREATE INDEX IF NOT EXISTS idx_reservations_station ON reservations (station_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_email);
