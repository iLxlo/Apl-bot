// database/greeter.db
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/greeter/greeter.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    /* console.log('Connected to the greeter database.'); */

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        guildId TEXT PRIMARY KEY,
        channelId TEXT,
        deletionTime INTEGER
      )
    `, (createSettingsTableErr) => {
      if (createSettingsTableErr) {
        console.error('Error creating settings table:', createSettingsTableErr.message);
      } else {
        /* console.log('Settings table created or already exists.'); */
      }
    });
  }
});

export default db;
