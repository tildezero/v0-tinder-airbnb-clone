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
    first_name TEXT,
    last_name TEXT,
    middle_initial TEXT,
    driver_license TEXT,
    driver_license_state TEXT,
    default_credit_card TEXT,
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
    renter_id TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total_price REAL NOT NULL,
    reservation_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    guest_first_name TEXT,
    guest_last_name TEXT,
    guest_middle_initial TEXT,
    guest_email TEXT,
    guest_credit_card TEXT,
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
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 10),
    comment TEXT NOT NULL,
    reservation_number TEXT NOT NULL,
    stay_start_date TEXT,
    stay_end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

// Add new columns to existing tables if they don't exist (for migrations)
try {
  db.exec(`
    ALTER TABLE users ADD COLUMN first_name TEXT;
    ALTER TABLE users ADD COLUMN last_name TEXT;
    ALTER TABLE users ADD COLUMN middle_initial TEXT;
    ALTER TABLE users ADD COLUMN driver_license TEXT;
    ALTER TABLE users ADD COLUMN driver_license_state TEXT;
    ALTER TABLE users ADD COLUMN default_credit_card TEXT;
  `)
} catch (e) {
  // Columns already exist, ignore
}

try {
  db.exec(`
    ALTER TABLE bookings ADD COLUMN subtotal REAL;
    ALTER TABLE bookings ADD COLUMN tax REAL;
    ALTER TABLE bookings ADD COLUMN reservation_number TEXT;
    ALTER TABLE bookings ADD COLUMN guest_first_name TEXT;
    ALTER TABLE bookings ADD COLUMN guest_last_name TEXT;
    ALTER TABLE bookings ADD COLUMN guest_middle_initial TEXT;
    ALTER TABLE bookings ADD COLUMN guest_email TEXT;
    ALTER TABLE bookings ADD COLUMN guest_credit_card TEXT;
  `)
} catch (e) {
  // Columns already exist, ignore
}

try {
  db.exec(`
    ALTER TABLE reviews ADD COLUMN reservation_number TEXT;
    ALTER TABLE reviews ADD COLUMN stay_start_date TEXT;
    ALTER TABLE reviews ADD COLUMN stay_end_date TEXT;
  `)
} catch (e) {
  // Columns already exist, ignore
}

// Update existing bookings to have reservation numbers if they don't
try {
  db.exec(`
    UPDATE bookings 
    SET reservation_number = 'RES-' || printf('%06d', id) 
    WHERE reservation_number IS NULL OR reservation_number = '';
  `)
} catch (e) {
  // Ignore errors
}

export default db

