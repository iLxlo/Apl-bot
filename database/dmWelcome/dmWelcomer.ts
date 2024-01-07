import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/welcomeSettings.db', (err) => {
  if (err) {
    console.error('Error opening welcome database:', err.message);
  } else {
    /* console.log('Connected to the welcome database.'); */

    db.run(`
      CREATE TABLE IF NOT EXISTS welcomeSettings (
        guildId TEXT PRIMARY KEY,
        welcomeMessage TEXT,
        welcomeToggle INTEGER
      )
    `, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating welcomeSettings table:', createTableErr.message);
      } else {
       /* console.log('welcomeSettings table created or already exists.'); */
      }
    });
  }
});

export default db;
