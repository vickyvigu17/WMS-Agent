const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './database.sqlite';

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    // Clients table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        industry TEXT,
        company_size TEXT,
        location TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        start_date DATE,
        expected_completion DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )
    `);

    // Market research table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS market_research (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        research_type TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT,
        relevance_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )
    `);

    // Questions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        question_type TEXT DEFAULT 'general',
        priority INTEGER DEFAULT 1,
        is_answered BOOLEAN DEFAULT 0,
        answer TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `);

    // WMS processes reference table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS wms_processes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        process_name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        typical_questions TEXT,
        technical_considerations TEXT
      )
    `);

    this.seedWMSProcesses();
  }

  seedWMSProcesses() {
    const processes = [
      {
        process_name: 'Receiving',
        category: 'Inbound Operations',
        description: 'Managing incoming shipments and inventory',
        typical_questions: JSON.stringify([
          'What is your current receiving process?',
          'How do you handle ASN (Advanced Shipping Notice)?',
          'What are your peak receiving volumes?',
          'How do you manage quality control during receiving?'
        ]),
        technical_considerations: 'Integration with supplier systems, barcode/RFID scanning, dock scheduling'
      },
      {
        process_name: 'Put-away',
        category: 'Inbound Operations', 
        description: 'Storing received items in optimal locations',
        typical_questions: JSON.stringify([
          'What is your current put-away strategy?',
          'How do you determine storage locations?',
          'Do you use directed put-away?',
          'What are your slotting optimization requirements?'
        ]),
        technical_considerations: 'Location management, slotting algorithms, travel optimization'
      },
      {
        process_name: 'Picking',
        category: 'Outbound Operations',
        description: 'Retrieving items for order fulfillment',
        typical_questions: JSON.stringify([
          'What picking methods do you currently use?',
          'What is your order picking accuracy rate?',
          'How do you handle batch picking?',
          'Do you need pick path optimization?'
        ]),
        technical_considerations: 'Pick strategies, wave planning, pick path optimization, pick validation'
      },
      {
        process_name: 'Shipping',
        category: 'Outbound Operations',
        description: 'Managing outbound shipments',
        typical_questions: JSON.stringify([
          'What carriers do you work with?',
          'How do you handle shipping documentation?',
          'What are your shipping volume requirements?',
          'Do you need integration with carrier systems?'
        ]),
        technical_considerations: 'Carrier integration, shipping labels, tracking, EDI'
      },
      {
        process_name: 'Inventory Management',
        category: 'Inventory Control',
        description: 'Tracking and managing inventory levels',
        typical_questions: JSON.stringify([
          'How do you currently track inventory?',
          'What are your cycle counting requirements?',
          'How do you handle inventory adjustments?',
          'Do you need lot/serial number tracking?'
        ]),
        technical_considerations: 'Real-time inventory tracking, cycle counting, lot tracking, expiration date management'
      }
    ];

    processes.forEach(process => {
      this.db.run(`
        INSERT OR IGNORE INTO wms_processes 
        (process_name, category, description, typical_questions, technical_considerations)
        VALUES (?, ?, ?, ?, ?)
      `, [process.process_name, process.category, process.description, 
          process.typical_questions, process.technical_considerations]);
    });
  }

  // Helper methods for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();