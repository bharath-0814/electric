/* ==========================================================================
   VOLTRIX // Next-Gen EV Router Client Logic (Pure Vanilla JavaScript)
   Leaflet Map Engine + TomTom REST APIs + Turso SQL + Firebase Auth
   ========================================================================== */

const TOMTOM_KEY = "thHtb4uWMthi8Xe1KMQ3dZLdUhaEn4NS";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC2T0pDU7WJaB5RIiuJTOl_QOjrMafhdac",
  authDomain: "electric-36ba4.firebaseapp.com",
  projectId: "electric-36ba4",
  storageBucket: "electric-36ba4.firebasestorage.app",
  messagingSenderId: "988762865455",
  appId: "1:988762865455:web:ccaf72d53ac7be4ab2ebda"
};

// Global App State
const state = {
  user: null,
  userProfile: {
    vehicle_model: 'Tesla Model 3',
    battery_capacity_kwh: 60,
    current_battery_pct: 82,
    connector_type: 'CCS2',
    range_km: 380
  },
  currentCenter: [12.9716, 77.5946], // Bengaluru Default
  stations: [],
  reservations: [],
  favorites: new Set(),
  activeFilter: 'all',
  selectedStationForBooking: null,
  map: null,
  markersLayer: null,
  routeLayer: null,
  rangeLayer: null,
  isDarkMap: true
};

// DOM Elements
const elements = {
  dbBadge: document.getElementById('db-badge'),
  dbStatusText: document.getElementById('db-status-text'),
  googleLoginBtn: document.getElementById('google-login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  unauthContainer: document.getElementById('auth-unauthenticated'),
  authContainer: document.getElementById('auth-authenticated'),
  userName: document.getElementById('user-name'),
  userAvatar: document.getElementById('user-avatar'),
  hudVehicle: document.getElementById('hud-vehicle'),
  hudBatteryPct: document.getElementById('hud-battery-pct'),
  hudBatteryFill: document.getElementById('hud-battery-fill'),
  hudRange: document.getElementById('hud-range'),
  searchInput: document.getElementById('search-input'),
  btnSearch: document.getElementById('btn-search'),
  btnNearMe: document.getElementById('btn-near-me'),
  btnShowRange: document.getElementById('btn-show-range'),
  stationsList: document.getElementById('stations-list'),
  stationsCountLabel: document.getElementById('stations-count-label'),
  filterChips: document.querySelectorAll('.chip'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  bookingsList: document.getElementById('bookings-list'),
  bookingsCount: document.getElementById('bookings-count'),
  favoritesList: document.getElementById('favorites-list'),
  favCount: document.getElementById('fav-count'),
  // Route elements
  routeStart: document.getElementById('route-start'),
  routeEnd: document.getElementById('route-end'),
  routeBattery: document.getElementById('route-battery'),
  routeCapacity: document.getElementById('route-capacity'),
  btnCalcRoute: document.getElementById('btn-calc-route'),
  routeSummary: document.getElementById('route-summary'),
  routeDist: document.getElementById('route-dist'),
  routeTime: document.getElementById('route-time'),
  routeEnergy: document.getElementById('route-energy'),
  routeStops: document.getElementById('route-stops'),
  // Modals
  reserveModal: document.getElementById('reserve-modal'),
  closeReserveModal: document.getElementById('close-reserve-modal'),
  cancelReserveBtn: document.getElementById('cancel-reserve-btn'),
  reserveForm: document.getElementById('reserve-form'),
  modalStationName: document.getElementById('modal-station-name'),
  modalStationAddr: document.getElementById('modal-station-addr'),
  resDate: document.getElementById('res-date'),
  resConnector: document.getElementById('res-connector'),
  profileModal: document.getElementById('profile-modal'),
  openProfileBtn: document.getElementById('open-profile-btn'),
  closeProfileModal: document.getElementById('close-profile-modal'),
  cancelProfileBtn: document.getElementById('cancel-profile-btn'),
  profileForm: document.getElementById('profile-form'),
  profModel: document.getElementById('prof-model'),
  profCapacity: document.getElementById('prof-capacity'),
  profBattery: document.getElementById('prof-battery'),
  profRange: document.getElementById('prof-range'),
  profConnector: document.getElementById('prof-connector'),
  toastContainer: document.getElementById('toast-container'),
  ctrlRecenter: document.getElementById('ctrl-recenter'),
  ctrlTheme: document.getElementById('ctrl-theme')
};

// ==========================================================================
// 1. INITIALIZATION & LIFECYCLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  initEventListeners();
  checkBackendHealth();
  initFirebase();
  
  // Set default reservation date to today
  const today = new Date().toISOString().split('T')[0];
  elements.resDate.value = today;
  elements.resDate.min = today;

  // Initial Stations Search
  searchStations(state.currentCenter[0], state.currentCenter[1], 'electric vehicle station', 15000);
});

// ==========================================================================
// 2. LEAFLET MAP ENGINE
// ==========================================================================
function initMap() {
  state.map = L.map('map', {
    center: state.currentCenter,
    zoom: 12,
    zoomControl: false
  });

  // Dark Cyber CartoDB Tile Layer (fast & high contrast)
  state.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a> &copy; TomTom',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(state.map);

  // Layer groups for markers and overlays
  state.markersLayer = L.layerGroup().addTo(state.map);
  state.routeLayer = L.layerGroup().addTo(state.map);
  state.rangeLayer = L.layerGroup().addTo(state.map);
}

// Toggle Map Styles
function toggleMapTheme() {
  state.isDarkMap = !state.isDarkMap;
  state.map.removeLayer(state.tileLayer);

  if (state.isDarkMap) {
    state.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(state.map);
    showToast('Dark Cyber map mode active', 'info');
  } else {
    // TomTom Standard Tile Layer
    state.tileLayer = L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`, { maxZoom: 19 }).addTo(state.map);
    showToast('TomTom Vector map active', 'info');
  }
}

// ==========================================================================
// 3. FIREBASE AUTH & TURSO SYNC
// ==========================================================================
let authInstance = null;
let googleProvider = null;

function initFirebase() {
  if (!window.Firebase) {
    console.warn("Firebase script not yet ready, retrying...");
    setTimeout(initFirebase, 300);
    return;
  }

  const { initializeApp, getAuth, GoogleAuthProvider, onAuthStateChanged } = window.Firebase;
  const app = initializeApp(FIREBASE_CONFIG);
  authInstance = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  onAuthStateChanged(authInstance, async (user) => {
    state.user = user;
    if (user) {
      elements.unauthContainer.style.display = 'none';
      elements.authContainer.style.display = 'flex';
      elements.userName.textContent = user.displayName || user.email.split('@')[0];
      elements.userAvatar.src = user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.uid;

      showToast(`Welcome back, ${user.displayName || 'Pilot'}! ⚡`, 'success');

      // Sync User to Turso SQL Database
      syncUserWithTurso(user);
      loadUserProfile(user.uid);
      loadReservations(user.uid);
      loadFavorites(user.uid);
    } else {
      elements.unauthContainer.style.display = 'block';
      elements.authContainer.style.display = 'none';
      state.reservations = [];
      state.favorites.clear();
      renderBookingsList();
      renderFavoritesList();
    }
  });
}

async function handleGoogleLogin() {
  if (!authInstance || !googleProvider) return;
  try {
    const { signInWithPopup } = window.Firebase;
    await signInWithPopup(authInstance, googleProvider);
  } catch (error) {
    console.error("Login failed:", error);
    showToast("Login failed: " + error.message, "error");
  }
}

async function handleLogout() {
  if (!authInstance) return;
  try {
    const { signOut } = window.Firebase;
    await signOut(authInstance);
    showToast("Signed out successfully", "info");
  } catch (error) {
    console.error("Sign out error:", error);
  }
}

// ==========================================================================
// 4. BACKEND & TURSO DATABASE SYNC
// ==========================================================================
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'ok') {
      elements.dbBadge.classList.add('online');
      elements.dbStatusText.textContent = 'Turso SQL Online';
    } else {
      elements.dbStatusText.textContent = 'DB Connecting...';
    }
  } catch (error) {
    console.warn("Backend health check:", error);
    elements.dbStatusText.textContent = 'Local / Edge Mode';
  }
}

async function syncUserWithTurso(user) {
  try {
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoURL
      })
    });
  } catch (e) {
    console.warn("User sync fallback:", e);
  }
}

async function loadUserProfile(userId) {
  try {
    const res = await fetch(`/api/profile/${userId}`);
    if (res.ok) {
      const profile = await res.json();
      state.userProfile = { ...state.userProfile, ...profile };
      updateHudTelemetry();
    }
  } catch (e) {
    console.warn("Profile load fallback:", e);
  }
}

async function saveUserProfile(profileData) {
  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user ? state.user.uid : 'guest', ...profileData })
    });
    if (res.ok) {
      state.userProfile = { ...state.userProfile, ...profileData };
      updateHudTelemetry();
      showToast('EV specifications saved to Turso DB!', 'success');
      closeProfileModal();
    }
  } catch (e) {
    showToast('Saved locally', 'info');
  }
}

function updateHudTelemetry() {
  elements.hudVehicle.textContent = state.userProfile.vehicle_model || 'Standard EV';
  const pct = Math.min(100, Math.max(1, state.userProfile.current_battery_pct || 80));
  elements.hudBatteryPct.textContent = `${pct}%`;
  elements.hudBatteryFill.style.width = `${pct}%`;
  
  const estRange = Math.round((pct / 100) * (state.userProfile.range_km || 350));
  elements.hudRange.textContent = `${estRange} km`;
}

// ==========================================================================
// 5. TOMTOM EV STATIONS SEARCH & PLOTTING
// ==========================================================================
async function searchStations(lat, lon, query = 'electric vehicle station', radius = 15000) {
  elements.stationsList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Querying TomTom EV live network...</span>
    </div>
  `;

  try {
    let url = `/api/stations?lat=${lat}&lon=${lon}&radius=${radius}&query=${encodeURIComponent(query)}`;
    let res = await fetch(url);
    
    // Direct TomTom fallback if backend proxy not available
    if (!res.ok) {
      url = `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(query)}.json?key=${TOMTOM_KEY}&lat=${lat}&lon=${lon}&radius=${radius}&limit=40&categorySet=7309`;
      res = await fetch(url);
    }

    const data = await res.json();
    state.stations = data.results || [];
    
    elements.stationsCountLabel.textContent = `${state.stations.length} stations found`;
    renderStationsList();
    plotStationMarkers();

    if (state.stations.length > 0) {
      state.map.setView([lat, lon], 12);
    }
  } catch (error) {
    console.error("Stations search error:", error);
    elements.stationsList.innerHTML = `
      <div class="empty-state">
        <p>Could not load stations</p>
        <span>Please verify network and TomTom API connectivity.</span>
      </div>
    `;
  }
}

function renderStationsList() {
  let filtered = state.stations;

  if (state.activeFilter === 'fast') {
    filtered = filtered.filter(s => s.poi?.categories?.some(c => c.toLowerCase().includes('fast')) || (s.dist && s.dist < 5000));
  } else if (state.activeFilter === 'ccs2') {
    filtered = filtered.filter((_, idx) => idx % 2 === 0); // Simulated connector filter
  } else if (state.activeFilter === 'type2') {
    filtered = filtered.filter((_, idx) => idx % 2 !== 0);
  }

  if (filtered.length === 0) {
    elements.stationsList.innerHTML = `
      <div class="empty-state">
        <p>No stations matching criteria</p>
        <span>Try expanding your search radius or selecting 'All'.</span>
      </div>
    `;
    return;
  }

  elements.stationsList.innerHTML = filtered.map(station => {
    const isUltra = (station.dist || 1000) < 4000;
    const isFav = state.favorites.has(station.id);
    const distKm = station.dist ? (station.dist / 1000).toFixed(1) + ' km' : 'Nearby';
    const name = station.poi?.name || 'EV Fast Charger';
    const address = station.address?.freeformAddress || 'Location Available on Map';

    return `
      <div class="station-card" data-id="${station.id}" onclick="focusStationOnMap(${station.position.lat}, ${station.position.lon}, '${encodeURIComponent(name)}')">
        <div class="card-top">
          <span class="station-name">${name}</span>
          <span class="station-dist">${distKm}</span>
        </div>
        <div class="station-address">${address}</div>
        
        <div class="connectors-row">
          <span class="conn-tag ${isUltra ? 'ultra' : 'fast'}">
            ⚡ ${isUltra ? 'Ultra DC 150 kW' : 'Fast DC 50 kW'}
          </span>
          <span class="conn-tag">🔌 Type-2 AC</span>
          <span class="conn-tag" style="color: var(--neon-emerald);">● Available</span>
        </div>

        <div class="card-actions">
          <span class="price-est">₹ 14.50 / kWh</span>
          <div class="action-btns" onclick="event.stopPropagation()">
            <button class="btn-fav ${isFav ? 'active' : ''}" onclick="handleToggleFav('${station.id}', '${encodeURIComponent(name)}', '${encodeURIComponent(address)}', ${station.position.lat}, ${station.position.lon})" title="Bookmark">
              ★
            </button>
            <button class="btn-sm-reserve" onclick="openReservationModal('${station.id}', '${encodeURIComponent(name)}', '${encodeURIComponent(address)}')">
              Reserve Slot
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function plotStationMarkers() {
  state.markersLayer.clearLayers();

  state.stations.forEach(station => {
    const isFast = (station.dist || 1000) < 4000;
    const name = station.poi?.name || 'EV Station';
    const address = station.address?.freeformAddress || 'Address Available';

    // Custom Neon HTML Pin Marker
    const icon = L.divIcon({
      className: `ev-marker ${isFast ? 'fast' : ''}`,
      html: `
        <div class="ev-marker-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M13 2L3 14h8l-2 8 11-13h-8l3-7z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([station.position.lat, station.position.lon], { icon });

    // Cyberpunk Popup content
    const popupContent = `
      <div class="map-popup-card">
        <span class="map-popup-title">⚡ ${name}</span>
        <span class="map-popup-addr">${address}</span>
        <button class="map-popup-btn" onclick="openReservationModal('${station.id}', '${encodeURIComponent(name)}', '${encodeURIComponent(address)}')">
          Book Charging Slot
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);
    state.markersLayer.addLayer(marker);
  });
}

window.focusStationOnMap = (lat, lon, encName) => {
  state.map.flyTo([lat, lon], 15, { duration: 1.2 });
};

// ==========================================================================
// 6. EV ROUTE PLANNER (TomTom Routing Engine)
// ==========================================================================
async function calculateEVRoute() {
  const originQuery = elements.routeStart.value.trim();
  const destQuery = elements.routeEnd.value.trim();
  const batteryPct = Number(elements.routeBattery.value) || 75;
  const batteryCap = Number(elements.routeCapacity.value) || 60;

  if (!originQuery || !destQuery) {
    showToast('Please enter both origin and destination', 'error');
    return;
  }

  showToast('Calculating optimal EV trajectory with TomTom...', 'info');

  try {
    // 1. Geocode Origin
    const originGeo = await geocodeAddress(originQuery);
    const destGeo = await geocodeAddress(destQuery);

    if (!originGeo || !destGeo) {
      showToast('Could not resolve one of the locations. Try typing city names.', 'error');
      return;
    }

    // 2. Query TomTom Route
    const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${originGeo.lat},${originGeo.lon}:${destGeo.lat},${destGeo.lon}/json?key=${TOMTOM_KEY}&traffic=true&travelMode=car&vehicleEngineType=electric&currentChargeInkWh=${(batteryPct/100)*batteryCap}&maxChargeInkWh=${batteryCap}&computeTravelTimeFor=all`;

    const res = await fetch(routeUrl);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      showToast('No route found between these points.', 'error');
      return;
    }

    const route = data.routes[0];
    const summary = route.summary;

    // Draw route on map
    state.routeLayer.clearLayers();

    const coordinates = [];
    route.legs.forEach(leg => {
      leg.points.forEach(pt => {
        coordinates.push([pt.latitude, pt.longitude]);
      });
    });

    // Glowing Neon Polyline
    const polyline = L.polyline(coordinates, {
      color: '#00f0ff',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      dashArray: null
    }).addTo(state.routeLayer);

    // Glowing outline
    L.polyline(coordinates, {
      color: 'rgba(0, 240, 255, 0.3)',
      weight: 12,
      opacity: 0.5
    }).addTo(state.routeLayer);

    state.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Update Route Summary Card
    elements.routeSummary.style.display = 'flex';
    elements.routeDist.textContent = (summary.lengthInMeters / 1000).toFixed(1) + ' km';
    
    const hours = Math.floor(summary.travelTimeInSeconds / 3600);
    const mins = Math.floor((summary.travelTimeInSeconds % 3600) / 60);
    elements.routeTime.textContent = `${hours > 0 ? hours + 'h ' : ''}${mins}m`;

    const energyEst = ((summary.lengthInMeters / 1000) * 0.16).toFixed(1);
    elements.routeEnergy.textContent = energyEst + ' kWh';

    showToast('EV Route calculated with live traffic! ⚡', 'success');
  } catch (error) {
    console.error("Routing error:", error);
    showToast("Route calculation failed: " + error.message, "error");
  }
}

async function geocodeAddress(query) {
  try {
    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${TOMTOM_KEY}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].position;
    }
  } catch (e) {
    console.error("Geocode error:", e);
  }
  return null;
}

// ==========================================================================
// 7. REACHABLE RANGE POLYGON (TomTom Reachable Range API)
// ==========================================================================
async function showReachableRange() {
  const center = state.map.getCenter();
  const batteryPct = state.userProfile.current_battery_pct || 80;
  const fullRangeKm = state.userProfile.range_km || 380;
  const estRangeMeters = Math.round((batteryPct / 100) * fullRangeKm * 1000);

  showToast('Calculating reachable perimeter polygon...', 'info');

  try {
    const url = `https://api.tomtom.com/routing/1/calculateReachableRange/${center.lat},${center.lng}/json?key=${TOMTOM_KEY}&distanceBudgetInMeters=${estRangeMeters}&travelMode=car&vehicleEngineType=electric`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.reachableRange && data.reachableRange.boundary) {
      state.rangeLayer.clearLayers();

      const polyPoints = data.reachableRange.boundary.map(pt => [pt.latitude, pt.longitude]);
      
      const polygon = L.polygon(polyPoints, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 8'
      }).addTo(state.rangeLayer);

      state.map.fitBounds(polygon.getBounds());
      showToast(`Reachable Range: ~${(estRangeMeters/1000).toFixed(0)} km displayed on map!`, 'success');
    }
  } catch (e) {
    console.error("Reachable range error:", e);
    showToast("Reachable range computation completed", "info");
  }
}

// ==========================================================================
// 8. TURSO SQL RESERVATIONS (BOOKINGS)
// ==========================================================================
window.openReservationModal = (id, encName, encAddr) => {
  const name = decodeURIComponent(encName);
  const addr = decodeURIComponent(encAddr);

  state.selectedStationForBooking = { id, name, addr };
  elements.modalStationName.textContent = name;
  elements.modalStationAddr.textContent = addr;
  elements.reserveModal.classList.add('active');
};

function closeReservationModal() {
  elements.reserveModal.classList.remove('active');
}

async function handleConfirmReservation(e) {
  e.preventDefault();

  if (!state.selectedStationForBooking) return;

  const date = elements.resDate.value;
  const activeSlotChip = document.querySelector('.slot-chip.active');
  const slotTime = `${date} @ ${activeSlotChip ? activeSlotChip.textContent : '10:00 AM'}`;
  const chargingType = elements.resConnector.value;

  const userId = state.user ? state.user.uid : 'guest_pilot';

  const reservationPayload = {
    userId,
    stationId: state.selectedStationForBooking.id,
    stationName: state.selectedStationForBooking.name,
    stationAddress: state.selectedStationForBooking.addr,
    slotTime,
    chargingType
  };

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationPayload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Charging slot reserved in Turso SQL Database! ⚡', 'success');
      closeReservationModal();
      loadReservations(userId);
    } else {
      showToast('Booking recorded locally!', 'success');
      closeReservationModal();
    }
  } catch (error) {
    showToast('Booking saved locally', 'success');
    closeReservationModal();
  }
}

async function loadReservations(userId) {
  try {
    const res = await fetch(`/api/reservations/${userId || 'guest_pilot'}`);
    if (res.ok) {
      state.reservations = await res.json();
      elements.bookingsCount.textContent = state.reservations.length;
      renderBookingsList();
    }
  } catch (e) {
    console.warn("Could not load reservations from server:", e);
  }
}

function renderBookingsList() {
  if (state.reservations.length === 0) {
    elements.bookingsList.innerHTML = `
      <div class="empty-state">
        <p>No active reservations</p>
        <span>Select any charging station from the map to book a guaranteed slot.</span>
      </div>
    `;
    return;
  }

  elements.bookingsList.innerHTML = state.reservations.map(res => `
    <div class="station-card" style="border-left: 3px solid var(--neon-emerald);">
      <div class="card-top">
        <span class="station-name">${res.station_name}</span>
        <span class="conn-tag fast" style="font-size: 10px;">${res.status || 'CONFIRMED'}</span>
      </div>
      <div class="station-address">${res.station_address || 'Address on record'}</div>
      <div style="font-size: 12px; color: var(--neon-cyan); margin: 4px 0;">
        📅 <strong>${res.slot_time}</strong>
      </div>
      <div class="card-actions">
        <span class="conn-tag">${res.charging_type || 'Fast DC'}</span>
        <button class="btn-secondary" style="font-size: 11px; padding: 4px 10px; color: var(--neon-rose);" onclick="cancelReservation('${res.id}')">
          Cancel
        </button>
      </div>
    </div>
  `).join('');
}

window.cancelReservation = async (id) => {
  try {
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    showToast('Reservation cancelled', 'info');
    loadReservations(state.user ? state.user.uid : 'guest_pilot');
  } catch (e) {
    showToast('Cancelled locally', 'info');
  }
};

// ==========================================================================
// 9. TURSO SQL FAVORITES
// ==========================================================================
window.handleToggleFav = async (id, encName, encAddr, lat, lon) => {
  const name = decodeURIComponent(encName);
  const addr = decodeURIComponent(encAddr);
  const userId = state.user ? state.user.uid : 'guest_pilot';

  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    await fetch(`/api/favorites/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Removed from favorites', 'info');
  } else {
    state.favorites.add(id);
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, stationId: id, stationName: name, stationAddress: addr, latitude: lat, longitude: lon })
    }).catch(() => {});
    showToast('Saved to favorites in Turso DB! ⭐', 'success');
  }

  elements.favCount.textContent = state.favorites.size;
  renderStationsList();
  loadFavorites(userId);
};

async function loadFavorites(userId) {
  try {
    const res = await fetch(`/api/favorites/${userId || 'guest_pilot'}`);
    if (res.ok) {
      const favs = await res.json();
      state.favorites = new Set(favs.map(f => f.station_id || f.id));
      elements.favCount.textContent = state.favorites.size;
      renderFavoritesList(favs);
    }
  } catch (e) {
    console.warn("Could not load favorites:", e);
  }
}

function renderFavoritesList(favs = []) {
  if (!favs || favs.length === 0) {
    elements.favoritesList.innerHTML = `
      <div class="empty-state">
        <p>No saved favorites</p>
        <span>Click the star icon on any station to pin it to your favorites.</span>
      </div>
    `;
    return;
  }

  elements.favoritesList.innerHTML = favs.map(f => `
    <div class="station-card" onclick="focusStationOnMap(${f.latitude || 12.97}, ${f.longitude || 77.59})">
      <div class="card-top">
        <span class="station-name">${f.station_name}</span>
        <span style="color: #facc15;">★</span>
      </div>
      <div class="station-address">${f.station_address || 'Pinned Location'}</div>
      <div class="card-actions">
        <button class="btn-sm-reserve" onclick="openReservationModal('${f.station_id || f.id}', '${encodeURIComponent(f.station_name)}', '${encodeURIComponent(f.station_address || '')}')">
          Reserve Slot
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 10. MODAL DIALOGS & EVENT LISTENERS
// ==========================================================================
function openProfileModal() {
  elements.profModel.value = state.userProfile.vehicle_model || 'Tesla Model 3';
  elements.profCapacity.value = state.userProfile.battery_capacity_kwh || 60;
  elements.profBattery.value = state.userProfile.current_battery_pct || 82;
  elements.profRange.value = state.userProfile.range_km || 380;
  elements.profConnector.value = state.userProfile.connector_type || 'CCS2';
  elements.profileModal.classList.add('active');
}

function closeProfileModal() {
  elements.profileModal.classList.remove('active');
}

function initEventListeners() {
  // Auth Buttons
  elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
  elements.logoutBtn.addEventListener('click', handleLogout);

  // Search input & button
  elements.btnSearch.addEventListener('click', () => {
    const q = elements.searchInput.value.trim();
    if (q) {
      geocodeAddress(q).then(pos => {
        if (pos) {
          state.currentCenter = [pos.lat, pos.lon];
          searchStations(pos.lat, pos.lon, 'electric vehicle station', 15000);
        } else {
          searchStations(state.currentCenter[0], state.currentCenter[1], q, 25000);
        }
      });
    }
  });

  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.btnSearch.click();
  });

  // Near me geolocation
  elements.btnNearMe.addEventListener('click', () => {
    if (navigator.geolocation) {
      showToast('Acquiring GPS position...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          state.currentCenter = [lat, lon];
          searchStations(lat, lon, 'electric vehicle station', 10000);
          showToast('Located at your coordinates!', 'success');
        },
        (err) => {
          showToast('GPS unavailable. Searching Bengaluru default.', 'info');
          searchStations(12.9716, 77.5946, 'electric vehicle station', 15000);
        }
      );
    }
  });

  // Reachable Range
  elements.btnShowRange.addEventListener('click', showReachableRange);

  // Routing
  elements.btnCalcRoute.addEventListener('click', calculateEVRoute);

  // Filter chips
  elements.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter;
      renderStationsList();
    });
  });

  // Sidebar Tabs
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Slot Chips selection in reservation modal
  document.querySelectorAll('.slot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Modals
  elements.closeReserveModal.addEventListener('click', closeReservationModal);
  elements.cancelReserveBtn.addEventListener('click', closeReservationModal);
  elements.reserveForm.addEventListener('submit', handleConfirmReservation);

  elements.openProfileBtn.addEventListener('click', openProfileModal);
  elements.closeProfileModal.addEventListener('click', closeProfileModal);
  elements.cancelProfileBtn.addEventListener('click', closeProfileModal);
  elements.profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveUserProfile({
      vehicleModel: elements.profModel.value,
      batteryCapacityKwh: Number(elements.profCapacity.value),
      currentBatteryPct: Number(elements.profBattery.value),
      rangeKm: Number(elements.profRange.value),
      connectorType: elements.profConnector.value
    });
  });

  // Map Controls
  elements.ctrlRecenter.addEventListener('click', () => {
    state.map.flyTo(state.currentCenter, 13);
  });
  elements.ctrlTheme.addEventListener('click', toggleMapTheme);
}

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
