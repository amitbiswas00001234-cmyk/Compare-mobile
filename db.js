const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data', 'database');
const DB_FILE = path.join(DB_DIR, 'budgetpick.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_FILE);

// Promise wrappers
const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const exec = (sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

// Create tables
async function init() {
  await exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS phone_live_data (
      id TEXT PRIMARY KEY,
      brand TEXT,
      model TEXT,
      category TEXT,
      platforms TEXT, -- JSON string
      bestPrice TEXT, -- JSON string
      lastUpdated TEXT
    );

    CREATE TABLE IF NOT EXISTS price_history (
      phoneId TEXT,
      date TEXT,
      prices TEXT, -- JSON string
      PRIMARY KEY (phoneId, date)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      email TEXT,
      phoneId TEXT,
      targetPrice INTEGER,
      createdAt TEXT,
      PRIMARY KEY (email, phoneId, targetPrice)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      phoneId TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS laptop_live_data (
      id TEXT PRIMARY KEY,
      brand TEXT,
      model TEXT,
      category TEXT,
      platforms TEXT, -- JSON string
      bestPrice TEXT, -- JSON string
      lastUpdated TEXT
    );

    CREATE TABLE IF NOT EXISTS laptop_price_history (
      laptopId TEXT,
      date TEXT,
      prices TEXT, -- JSON string
      PRIMARY KEY (laptopId, date)
    );

    CREATE TABLE IF NOT EXISTS laptop_alerts (
      email TEXT,
      laptopId TEXT,
      targetPrice INTEGER,
      createdAt TEXT,
      PRIMARY KEY (email, laptopId, targetPrice)
    );

    CREATE TABLE IF NOT EXISTS laptop_wishlist (
      laptopId TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS fetch_logs (
      timestamp TEXT PRIMARY KEY,
      status TEXT,
      message TEXT
    );
  `);

  await migrateOldJsonData();
}

// Migrate data from existing JSON files if tables are empty
async function migrateOldJsonData() {
  // 1. Migrate Live Phone Cache
  const liveCount = await get(`SELECT COUNT(*) as count FROM phone_live_data`);
  const cacheFile = path.join(DB_DIR, 'cache.json');
  if (liveCount.count === 0 && fs.existsSync(cacheFile)) {
    try {
      console.log('🔄 Migrating cache.json to SQLite...');
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (cache && cache.phones) {
        for (const [id, phone] of Object.entries(cache.phones)) {
          await run(
            `INSERT OR REPLACE INTO phone_live_data (id, brand, model, category, platforms, bestPrice, lastUpdated)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              phone.brand,
              phone.model,
              phone.category,
              JSON.stringify(phone.platforms),
              JSON.stringify(phone.bestPrice),
              phone.lastUpdated
            ]
          );
        }
      }
      if (cache && cache.lastFullFetch) {
        await run(`INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)`, ['lastFullFetch', cache.lastFullFetch]);
      }
      fs.renameSync(cacheFile, cacheFile + '.bak');
      console.log('✅ Migrated cache.json successfully!');
    } catch (e) {
      console.error('⚠️ Error migrating cache.json:', e);
    }
  }

  // 2. Migrate Price History
  const historyCount = await get(`SELECT COUNT(*) as count FROM price_history`);
  const historyFile = path.join(DB_DIR, 'price_history.json');
  if (historyCount.count === 0 && fs.existsSync(historyFile)) {
    try {
      console.log('🔄 Migrating price_history.json to SQLite...');
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      if (history) {
        for (const [phoneId, entries] of Object.entries(history)) {
          if (Array.isArray(entries)) {
            for (const entry of entries) {
              await run(
                `INSERT OR IGNORE INTO price_history (phoneId, date, prices) VALUES (?, ?, ?)`,
                [phoneId, entry.date, JSON.stringify(entry.prices)]
              );
            }
          }
        }
      }
      fs.renameSync(historyFile, historyFile + '.bak');
      console.log('✅ Migrated price_history.json successfully!');
    } catch (e) {
      console.error('⚠️ Error migrating price_history.json:', e);
    }
  }

  // 3. Migrate Alerts
  const alertsCount = await get(`SELECT COUNT(*) as count FROM alerts`);
  const alertsFile = path.join(DB_DIR, 'alerts.json');
  if (alertsCount.count === 0 && fs.existsSync(alertsFile)) {
    try {
      console.log('🔄 Migrating alerts.json to SQLite...');
      const alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
      if (Array.isArray(alerts)) {
        for (const alert of alerts) {
          await run(
            `INSERT OR IGNORE INTO alerts (email, phoneId, targetPrice, createdAt) VALUES (?, ?, ?, ?)`,
            [alert.email, alert.phoneId, alert.targetPrice, alert.createdAt || new Date().toISOString()]
          );
        }
      }
      fs.renameSync(alertsFile, alertsFile + '.bak');
      console.log('✅ Migrated alerts.json successfully!');
    } catch (e) {
      console.error('⚠️ Error migrating alerts.json:', e);
    }
  }

  // 4. Migrate Wishlist
  const wishlistCount = await get(`SELECT COUNT(*) as count FROM wishlist`);
  const wishlistFile = path.join(DB_DIR, 'wishlist.json');
  if (wishlistCount.count === 0 && fs.existsSync(wishlistFile)) {
    try {
      console.log('🔄 Migrating wishlist.json to SQLite...');
      const wishlist = JSON.parse(fs.readFileSync(wishlistFile, 'utf8'));
      if (Array.isArray(wishlist)) {
        for (const phoneId of wishlist) {
          await run(`INSERT OR IGNORE INTO wishlist (phoneId) VALUES (?)`, [phoneId]);
        }
      }
      fs.renameSync(wishlistFile, wishlistFile + '.bak');
      console.log('✅ Migrated wishlist.json successfully!');
    } catch (e) {
      console.error('⚠️ Error migrating wishlist.json:', e);
    }
  }

  // 5. Migrate Fetch Logs
  const logsCount = await get(`SELECT COUNT(*) as count FROM fetch_logs`);
  const logsFile = path.join(DB_DIR, 'fetch_logs.json');
  if (logsCount.count === 0 && fs.existsSync(logsFile)) {
    try {
      console.log('🔄 Migrating fetch_logs.json to SQLite...');
      const logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
      if (Array.isArray(logs)) {
        for (const log of logs) {
          await run(
            `INSERT OR IGNORE INTO fetch_logs (timestamp, status, message) VALUES (?, ?, ?)`,
            [log.timestamp, log.status, log.message]
          );
        }
      }
      fs.renameSync(logsFile, logsFile + '.bak');
      console.log('✅ Migrated fetch_logs.json successfully!');
    } catch (e) {
      console.error('⚠️ Error migrating fetch_logs.json:', e);
    }
  }
}

// Database helper APIs
async function getLivePhones() {
  const rows = await all(`SELECT * FROM phone_live_data`);
  const phones = {};
  for (const r of rows) {
    phones[r.id] = {
      id: r.id,
      brand: r.brand,
      model: r.model,
      category: r.category,
      platforms: JSON.parse(r.platforms),
      bestPrice: JSON.parse(r.bestPrice),
      lastUpdated: r.lastUpdated
    };
  }
  const metaRow = await get(`SELECT value FROM metadata WHERE key = 'lastFullFetch'`);
  return {
    phones,
    lastFullFetch: metaRow ? metaRow.value : null
  };
}

async function saveLivePhone(id, phone) {
  await run(
    `INSERT OR REPLACE INTO phone_live_data (id, brand, model, category, platforms, bestPrice, lastUpdated)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      phone.brand,
      phone.model,
      phone.category,
      JSON.stringify(phone.platforms),
      JSON.stringify(phone.bestPrice),
      phone.lastUpdated
    ]
  );
}

async function updateLastFullFetch(timestamp) {
  await run(`INSERT OR REPLACE INTO metadata (key, value) VALUES ('lastFullFetch', ?)`, [timestamp]);
}

async function getPriceHistory(phoneId) {
  const rows = await all(`SELECT date, prices FROM price_history WHERE phoneId = ? ORDER BY date ASC`, [phoneId]);
  return rows.map(r => ({
    date: r.date,
    prices: JSON.parse(r.prices)
  }));
}

async function getAllPriceHistory() {
  const rows = await all(`SELECT phoneId, date, prices FROM price_history ORDER BY date ASC`);
  const history = {};
  for (const r of rows) {
    if (!history[r.phoneId]) history[r.phoneId] = [];
    history[r.phoneId].push({
      date: r.date,
      prices: JSON.parse(r.prices)
    });
  }
  return history;
}

async function savePriceHistory(phoneId, platforms) {
  const entry = { date: new Date().toISOString(), prices: {} };
  for (const [n, d] of Object.entries(platforms)) {
    if (d.price) entry.prices[n] = d.price;
  }
  if (Object.keys(entry.prices).length > 0) {
    await run(
      `INSERT OR REPLACE INTO price_history (phoneId, date, prices) VALUES (?, ?, ?)`,
      [phoneId, entry.date, JSON.stringify(entry.prices)]
    );
    
    // Clean up older records (limit to 90 per phone)
    const rows = await all(`SELECT date FROM price_history WHERE phoneId = ? ORDER BY date DESC`, [phoneId]);
    if (rows.length > 90) {
      const cutOffDate = rows[89].date;
      await run(`DELETE FROM price_history WHERE phoneId = ? AND date < ?`, [phoneId, cutOffDate]);
    }
  }
}

async function loadAlerts() {
  const rows = await all(`SELECT email, phoneId, targetPrice, createdAt FROM alerts`);
  return rows.map(r => ({
    email: r.email,
    phoneId: r.phoneId,
    targetPrice: r.targetPrice,
    createdAt: r.createdAt
  }));
}

async function saveAlert(email, phoneId, targetPrice) {
  await run(
    `INSERT OR IGNORE INTO alerts (email, phoneId, targetPrice, createdAt) VALUES (?, ?, ?, ?)`,
    [email, phoneId, parseInt(targetPrice), new Date().toISOString()]
  );
}

async function loadWishlist() {
  const rows = await all(`SELECT phoneId FROM wishlist`);
  return rows.map(r => r.phoneId);
}

async function saveWishlist(list) {
  await run(`DELETE FROM wishlist`);
  for (const phoneId of list) {
    await run(`INSERT OR IGNORE INTO wishlist (phoneId) VALUES (?)`, [phoneId]);
  }
}

async function logFetch(status, message) {
  const timestamp = new Date().toISOString();
  await run(
    `INSERT OR IGNORE INTO fetch_logs (timestamp, status, message) VALUES (?, ?, ?)`,
    [timestamp, status, message]
  );
  
  // Clean up older logs (keep last 50)
  const rows = await all(`SELECT timestamp FROM fetch_logs ORDER BY timestamp DESC`);
  if (rows.length > 50) {
    const cutOff = rows[49].timestamp;
    await run(`DELETE FROM fetch_logs WHERE timestamp < ?`, [cutOff]);
  }
}

async function getFetchLogs() {
  const rows = await all(`SELECT timestamp, status, message FROM fetch_logs ORDER BY timestamp DESC LIMIT 50`);
  return rows.map(r => ({
    timestamp: r.timestamp,
    status: r.status,
    message: r.message
  }));
}

async function getDatabaseMetrics() {
  const alerts = await get(`SELECT COUNT(*) as count FROM alerts`);
  const lAlerts = await get(`SELECT COUNT(*) as count FROM laptop_alerts`);
  
  const history = await get(`SELECT COUNT(*) as count FROM price_history`);
  const lHistory = await get(`SELECT COUNT(*) as count FROM laptop_price_history`);
  
  const phones = await get(`SELECT COUNT(*) as count FROM phone_live_data`);
  const laptops = await get(`SELECT COUNT(*) as count FROM laptop_live_data`);
  
  return {
    alertsCount: alerts.count + lAlerts.count,
    historyCount: history.count + lHistory.count,
    phonesCount: phones.count,
    laptopsCount: laptops.count
  };
}

// ── Laptop Database Helper Abstractions ──
async function getLiveLaptops() {
  const rows = await all(`SELECT * FROM laptop_live_data`);
  const laptops = {};
  for (const r of rows) {
    laptops[r.id] = {
      id: r.id,
      brand: r.brand,
      model: r.model,
      category: r.category,
      platforms: JSON.parse(r.platforms),
      bestPrice: JSON.parse(r.bestPrice),
      lastUpdated: r.lastUpdated
    };
  }
  const metaRow = await get(`SELECT value FROM metadata WHERE key = 'laptopLastFullFetch'`);
  return {
    laptops,
    lastFullFetch: metaRow ? metaRow.value : null
  };
}

async function saveLiveLaptop(id, laptop) {
  await run(
    `INSERT OR REPLACE INTO laptop_live_data (id, brand, model, category, platforms, bestPrice, lastUpdated)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      laptop.brand,
      laptop.model,
      laptop.category,
      JSON.stringify(laptop.platforms),
      JSON.stringify(laptop.bestPrice),
      laptop.lastUpdated
    ]
  );
}

async function updateLaptopLastFullFetch(timestamp) {
  await run(`INSERT OR REPLACE INTO metadata (key, value) VALUES ('laptopLastFullFetch', ?)`, [timestamp]);
}

async function getLaptopPriceHistory(laptopId) {
  const rows = await all(`SELECT date, prices FROM laptop_price_history WHERE laptopId = ? ORDER BY date ASC`, [laptopId]);
  return rows.map(r => ({
    date: r.date,
    prices: JSON.parse(r.prices)
  }));
}

async function getAllLaptopPriceHistory() {
  const rows = await all(`SELECT laptopId, date, prices FROM laptop_price_history ORDER BY date ASC`);
  const history = {};
  for (const r of rows) {
    if (!history[r.laptopId]) history[r.laptopId] = [];
    history[r.laptopId].push({
      date: r.date,
      prices: JSON.parse(r.prices)
    });
  }
  return history;
}

async function saveLaptopPriceHistory(laptopId, platforms) {
  const entry = { date: new Date().toISOString(), prices: {} };
  for (const [n, d] of Object.entries(platforms)) {
    if (d.price) entry.prices[n] = d.price;
  }
  if (Object.keys(entry.prices).length > 0) {
    await run(
      `INSERT OR REPLACE INTO laptop_price_history (laptopId, date, prices) VALUES (?, ?, ?)`,
      [laptopId, entry.date, JSON.stringify(entry.prices)]
    );
    
    const rows = await all(`SELECT date FROM laptop_price_history WHERE laptopId = ? ORDER BY date DESC`, [laptopId]);
    if (rows.length > 90) {
      const cutOffDate = rows[89].date;
      await run(`DELETE FROM laptop_price_history WHERE laptopId = ? AND date < ?`, [laptopId, cutOffDate]);
    }
  }
}

async function loadLaptopAlerts() {
  const rows = await all(`SELECT email, laptopId, targetPrice, createdAt FROM laptop_alerts`);
  return rows.map(r => ({
    email: r.email,
    laptopId: r.laptopId,
    targetPrice: r.targetPrice,
    createdAt: r.createdAt
  }));
}

async function saveLaptopAlert(email, laptopId, targetPrice) {
  await run(
    `INSERT OR IGNORE INTO laptop_alerts (email, laptopId, targetPrice, createdAt) VALUES (?, ?, ?, ?)`,
    [email, laptopId, parseInt(targetPrice), new Date().toISOString()]
  );
}

async function loadLaptopWishlist() {
  const rows = await all(`SELECT laptopId FROM laptop_wishlist`);
  return rows.map(r => r.laptopId);
}

async function saveLaptopWishlist(list) {
  await run(`DELETE FROM laptop_wishlist`);
  for (const laptopId of list) {
    await run(`INSERT OR IGNORE INTO laptop_wishlist (laptopId) VALUES (?)`, [laptopId]);
  }
}

module.exports = {
  init,
  getLivePhones,
  saveLivePhone,
  updateLastFullFetch,
  getPriceHistory,
  getAllPriceHistory,
  savePriceHistory,
  loadAlerts,
  saveAlert,
  loadWishlist,
  saveWishlist,
  logFetch,
  getFetchLogs,
  getDatabaseMetrics,
  
  getLiveLaptops,
  saveLiveLaptop,
  updateLaptopLastFullFetch,
  getLaptopPriceHistory,
  getAllLaptopPriceHistory,
  saveLaptopPriceHistory,
  loadLaptopAlerts,
  saveLaptopAlert,
  loadLaptopWishlist,
  saveLaptopWishlist
};
