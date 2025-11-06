import sqlite3 from 'sqlite3'; // Note the 'sqlite3' package name here
import { open } from 'sqlite';

// Define the database path
const dbPath = './sustainovate.db';

// SQL command to create the ideas table
const CREATE_IDEAS_TABLE = `
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_metric TEXT,
    submitter_name TEXT,
    submitter_email TEXT,
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

let db;

export async function getDb() {
    if (!db) {
        // Open the database connection
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Ensure the ideas table is created
        await db.exec(CREATE_IDEAS_TABLE);
        console.log('✅ Database connected and schema checked.');
    }
    return db;
}