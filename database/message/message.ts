import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/message/message.db', (err) => {
  if (err) {
    console.error('Error opening message database:', err.message);
  } else {
    /* console.log('Connected to the message database.');*/

    db.run(`
      CREATE TABLE IF NOT EXISTS messageCounts (
        userId TEXT PRIMARY KEY,
        count INTEGER
      )
    `, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating messageCounts table:', createTableErr.message);
      } else {
        /* console.log('messageCounts table created or already exists.'); */
      }
    });
  }
});

export const updateMessageCount = (userId: string, count: number) => {
  db.run(`
    INSERT OR REPLACE INTO messageCounts (userId, count)
    VALUES (?, ?)
  `, [userId, count], (err) => {
    if (err) {
      console.error('Error updating message count:', err.message);
    }
  });
};

export const getMessageCount = (userId: string, callback: (count: number) => void) => {
  db.get(`
    SELECT count FROM messageCounts WHERE userId = ?
  `, [userId], (err, row) => {
    if (err) {
      console.error('Error getting message count:', err.message);
      callback(0);
    } else {
      callback(row ? (row as { count: number }).count : 0);
    }
  });
};

export default db;
