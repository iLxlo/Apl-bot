import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/welcome/database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
     /* console.log('Connected to the database.'); */

    db.run(`
      CREATE TABLE IF NOT EXISTS yourTable (
        guildId TEXT PRIMARY KEY,
        welcomeChannelId TEXT
      )
    `, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating table:', createTableErr.message);
      } else {
       /* console.log('Table created or already exists.'); */
      }
    });
  }
});

export default db;
