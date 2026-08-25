# ⚡ VOLTRIX // Next-Gen EV Router & Charging Hub

> A high-performance, futuristic Electric Vehicle (EV) routing, station discovery, and slot reservation platform built with an **Apple VisionOS Liquid Glass** aesthetic. Powered by **TomTom Maps SDK v6**, **Turso Edge SQL Database**, **Firebase Auth**, and a **Serverless Node/Express** backend deployed on **Vercel**.

[![Live Deployment](https://img.shields.io/badge/Live-Vercel%20App-00f0ff?style=for-the-badge&logo=vercel)](https://electric-six.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Turso%20LibSQL-10b981?style=for-the-badge&logo=sqlite)](https://turso.tech/)
[![Maps](https://img.shields.io/badge/Maps-TomTom%20SDK%20v6-8b5cf6?style=for-the-badge&logo=tomtom)](https://developer.tomtom.com/)
[![Tech Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20Express-f59e0b?style=for-the-badge)](https://github.com/bharath-0814/electric)

---

## 🌟 Key Features

* **🗺️ Native TomTom Maps Engine (v6.25)**: Integrated official TomTom Web SDK featuring night mode styles, live traffic flow, incident overlays, and custom neon glowing EV pin markers.
* **🔍 Real-Time EV Station Discovery**: Search any city or landmark worldwide, or use GPS geolocation to find nearby charging stations with distance and plug specifications.
* **⚡ Filter by Charging Standards**: Quickly filter stations by **Ultra Fast DC (150 kW+)**, **Fast DC (50 kW)**, **Type-2 AC (22 kW)**, and live availability.
* **🚗 Intelligent EV Route Calculator**: Calculate driving trajectories with TomTom Traffic Engine, displaying estimated energy consumption (kWh), driving time, and distance.
* **🌐 Reachable Range Perimeter Polygon**: Calculates and renders your car's exact reachable geographic polygon on the map based on current battery charge level.
* **📅 Slot Reservation System**: Book and schedule charging sessions with date and time-slot selection, persisted directly to **Turso Edge SQL Database**.
* **⭐ Favorites & Bookmarking**: Pin your favorite charging stations to your account for fast navigation.
* **👤 EV Telemetry & Garage**: Configure vehicle model (Tesla, Nexon EV, Ioniq 5, etc.), battery pack capacity (kWh), current charge (%), and connector types.
* **🔥 Firebase Google Authentication**: One-click Google Sign-In with automatic profile synchronization to the Turso SQL database.
* **🍏 Apple VisionOS Liquid Glass UI**: Ultra-frosted glassmorphism (`backdrop-filter: blur(32px)`), multi-layered specular borders, floating island panels, and fluid ambient mesh gradients.

---

## 🛠️ Architecture & Tech Stack

```
                                  ┌─────────────────────────────┐
                                  │   Firebase Authentication   │
                                  │       (Google OAuth)        │
                                  └──────────────┬──────────────┘
                                                 │
┌────────────────────────────────────────┐       │       ┌───────────────────────────────┐
│           VOLTRIX Frontend             ├───────┴───────►       Node.js / Express       │
│  (Pure HTML5 + Liquid Glass CSS3 + JS) ├───────────────►  (Vercel Serverless Functions)│
└───────────────────┬────────────────────┘  REST API     └───────────────┬───────────────┘
                    │                                                    │
                    │ Vector Maps & Routing                              │ SQL Queries
                    ▼                                                    ▼
┌────────────────────────────────────────┐               ┌───────────────────────────────┐
│           TomTom Maps SDK v6           │               │     Turso Edge SQL (LibSQL)   │
│   (POI Search, Traffic, Range API)     │               │   (Users, Bookings, Favs)     │
└────────────────────────────────────────┘               └───────────────────────────────┘
```

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **HTML5 / CSS3 / Vanilla JS** | Pure JavaScript with zero frontend build steps, ultra-fast loading |
| **Styling** | **Liquid Glassmorphism** | Apple VisionOS-inspired frosted glass, specular highlights, neon accents |
| **Maps** | **TomTom Maps SDK for Web (v6)** | Vector tiles, live traffic, custom markers, GeoJSON routing layers |
| **Backend** | **Node.js & Express.js** | Serverless REST API deployed on Vercel |
| **Database** | **Turso (LibSQL / SQLite)** | Distributed edge database for user profiles, reservations, and favorites |
| **Auth** | **Firebase Auth** | Google Sign-In and session persistence |
| **Hosting** | **Vercel** | Unified deployment: Static Frontend + Serverless Functions |

---

## 📂 Project Structure

```text
electric/
├── api/
│   ├── index.js          # Express Serverless API (Turso DB & TomTom proxy)
│   └── init-db.js        # Turso database schema initialization script
├── public/
│   ├── index.html        # Main application layout & Firebase SDK
│   ├── style.css         # Apple Liquid Glass stylesheet & neon themes
│   └── script.js         # Client controller, TomTom map & event listeners
├── .env                  # Environment secrets & database credentials
├── package.json          # Node.js backend dependencies
├── vercel.json           # Vercel routing & serverless configuration
└── README.md             # Project documentation
```

---

## 🗄️ Database Schema (Turso SQL)

The platform utilizes four relational tables on Turso:

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. User EV Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  vehicle_model TEXT,
  battery_capacity_kwh REAL DEFAULT 60.0,
  current_battery_pct REAL DEFAULT 80.0,
  connector_type TEXT DEFAULT 'CCS2',
  range_km REAL DEFAULT 350.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Slot Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  station_id TEXT,
  station_name TEXT,
  station_address TEXT,
  slot_time TEXT,
  charging_type TEXT,
  status TEXT DEFAULT 'CONFIRMED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  station_id TEXT,
  station_name TEXT,
  station_address TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/bharath-0814/electric.git
cd electric
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
VITE_TURSO_DATABASE_URL="libsql://electric-bharath-0814.aws-ap-south-1.turso.io"
VITE_TURSO_AUTH_TOKEN="your_turso_auth_token"
VITE_TOMTOM_API_KEY="your_tomtom_api_key"
```

### 4. Initialize Database Tables
```bash
node api/init-db.js
```

### 5. Run the Application
You can run locally with Vercel CLI:
```bash
npx vercel dev
```
Or start the Express server and serve the `public/` directory:
```bash
node -e "
const app = require('./api/index.js');
const express = require('express');
app.use(express.static('public'));
app.listen(5000, () => console.log('Voltrix running on http://localhost:5000'));
"
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies server and Turso database connection |
| `POST` | `/api/users/sync` | Upserts Firebase user into the database |
| `GET` | `/api/profile/:userId` | Fetches vehicle parameters and battery profile |
| `POST` | `/api/profile` | Updates vehicle parameters |
| `GET` | `/api/reservations/:userId`| Lists confirmed reservations |
| `POST` | `/api/reservations` | Creates a new slot reservation |
| `DELETE`| `/api/reservations/:id` | Cancels a slot reservation |
| `GET` | `/api/favorites/:userId` | Retrieves bookmarked stations |
| `POST` | `/api/favorites` | Adds station to favorites |
| `DELETE`| `/api/favorites/:id` | Removes station from favorites |
| `GET` | `/api/stations` | Searches TomTom POI charging stations |
| `POST` | `/api/route` | Computes TomTom EV traffic route |
| `POST` | `/api/range` | Computes TomTom reachable range polygon |

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set **Framework Preset** to `Other` and **Root Directory** to `./`.
4. Add the following **Environment Variables** in Vercel settings:
   - `VITE_TURSO_DATABASE_URL`
   - `VITE_TURSO_AUTH_TOKEN`
   - `VITE_TOMTOM_API_KEY`
5. Click **Deploy**. Vercel will automatically configure the static frontend and convert `api/index.js` into a serverless function.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
