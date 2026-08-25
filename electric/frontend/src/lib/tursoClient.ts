import { createClient, type Client } from '@libsql/client/web';
import type { Reservation } from '../types';

let client: Client | null = null;

const dbUrl = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (dbUrl) {
  try {
    client = createClient({
      url: dbUrl,
      authToken: authToken || undefined,
    });
    console.log('[Evora Turso] Connected to LibSQL edge database.');
  } catch (err) {
    console.warn('[Evora Turso] Failed to initialize Turso client, falling back to local store:', err);
  }
}

const LOCAL_STORAGE_KEY_RESERVATIONS = 'evora_reservations';
const LOCAL_STORAGE_KEY_FAVORITES = 'evora_favorites';

export const tursoService = {
  // Get all reservations for a user
  async getUserReservations(userEmail: string): Promise<Reservation[]> {
    if (client) {
      try {
        const rs = await client.execute({
          sql: 'SELECT * FROM reservations WHERE user_email = ? ORDER BY start_time DESC',
          args: [userEmail],
        });
        return rs.rows.map((r) => ({
          id: String(r.id),
          stationId: String(r.station_id),
          stationName: String(r.station_name),
          stationAddress: String(r.station_address),
          userEmail: String(r.user_email),
          userName: String(r.user_name),
          portNumber: Number(r.port_number),
          connectorType: String(r.connector_type) as any,
          powerKw: Number(r.power_kw),
          startTime: String(r.start_time),
          durationMinutes: Number(r.duration_minutes),
          totalCost: Number(r.total_cost),
          status: String(r.status) as any,
          qrCode: String(r.qr_code),
          createdAt: String(r.created_at),
        }));
      } catch (err) {
        console.warn('[Evora Turso] DB query failed, using local storage:', err);
      }
    }

    // Fallback Local Storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RESERVATIONS);
      const list: Reservation[] = stored ? JSON.parse(stored) : [];
      return list.filter((item) => item.userEmail === userEmail || !userEmail);
    } catch {
      return [];
    }
  },

  // Save new reservation
  async createReservation(reservation: Reservation): Promise<Reservation> {
    if (client) {
      try {
        await client.execute({
          sql: `INSERT INTO reservations (
            id, station_id, station_name, station_address, user_email, user_name,
            port_number, connector_type, power_kw, start_time, duration_minutes,
            total_cost, status, qr_code, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            reservation.id,
            reservation.stationId,
            reservation.stationName,
            reservation.stationAddress,
            reservation.userEmail,
            reservation.userName,
            reservation.portNumber,
            reservation.connectorType,
            reservation.powerKw,
            reservation.startTime,
            reservation.durationMinutes,
            reservation.totalCost,
            reservation.status,
            reservation.qrCode,
            reservation.createdAt,
          ],
        });
      } catch (err) {
        console.warn('[Evora Turso] DB insert failed, writing to local storage fallback:', err);
      }
    }

    // Local Storage sync
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RESERVATIONS);
      const list: Reservation[] = stored ? JSON.parse(stored) : [];
      list.unshift(reservation);
      localStorage.setItem(LOCAL_STORAGE_KEY_RESERVATIONS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    return reservation;
  },

  // Cancel reservation
  async cancelReservation(id: string): Promise<boolean> {
    if (client) {
      try {
        await client.execute({
          sql: `UPDATE reservations SET status = 'cancelled' WHERE id = ?`,
          args: [id],
        });
      } catch (err) {
        console.warn(err);
      }
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RESERVATIONS);
      if (stored) {
        const list: Reservation[] = JSON.parse(stored);
        const updated = list.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r));
        localStorage.setItem(LOCAL_STORAGE_KEY_RESERVATIONS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  },

  // Get favorite station IDs
  async getFavorites(userEmail: string): Promise<string[]> {
    if (client && userEmail) {
      try {
        const rs = await client.execute({
          sql: 'SELECT station_id FROM favorites WHERE user_email = ?',
          args: [userEmail],
        });
        return rs.rows.map((r) => String(r.station_id));
      } catch (err) {
        console.warn(err);
      }
    }

    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_FAVORITES}_${userEmail || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Toggle favorite station
  async toggleFavorite(userEmail: string, stationId: string): Promise<boolean> {
    const key = `${LOCAL_STORAGE_KEY_FAVORITES}_${userEmail || 'guest'}`;
    let favorites: string[] = [];
    try {
      const stored = localStorage.getItem(key);
      favorites = stored ? JSON.parse(stored) : [];
    } catch {}

    const isFav = favorites.includes(stationId);
    if (isFav) {
      favorites = favorites.filter((id) => id !== stationId);
      if (client && userEmail) {
        await client.execute({
          sql: 'DELETE FROM favorites WHERE user_email = ? AND station_id = ?',
          args: [userEmail, stationId],
        }).catch(() => {});
      }
    } else {
      favorites.push(stationId);
      if (client && userEmail) {
        await client.execute({
          sql: 'INSERT OR IGNORE INTO favorites (id, user_email, station_id) VALUES (?, ?, ?)',
          args: [`${userEmail}_${stationId}`, userEmail, stationId],
        }).catch(() => {});
      }
    }

    localStorage.setItem(key, JSON.stringify(favorites));
    return !isFav;
  },
};
