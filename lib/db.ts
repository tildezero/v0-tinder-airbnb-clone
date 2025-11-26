import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

const dbDir = join(process.cwd(), "data")
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const dbPath = join(dbDir, "bumblebnb.db")
const db = new Database(dbPath)

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('homeowner', 'renter')),
    dob TEXT,
    payment TEXT,
    bio TEXT,
    address TEXT,
    avatar TEXT,
    rating REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    images TEXT NOT NULL,
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    zip_code TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_available INTEGER DEFAULT 1,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    renter_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    property_id INTEGER NOT NULL,
    property_title TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_rating REAL,
    requester_age INTEGER,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    property_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

export default db

