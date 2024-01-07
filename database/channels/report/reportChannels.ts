// ./database/channels/reportChannels.ts
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/channels/report/reportChannels.db', (err) => {
  if (err) {
    console.error('Error opening report channels database:', err.message);
  } else {
   /* console.log('Connected to the report channels database.'); */

    db.run(`
      CREATE TABLE IF NOT EXISTS reportChannels (
        userId TEXT PRIMARY KEY,
        channelId TEXT
      )
    `, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating reportChannels table:', createTableErr.message);
      } else {
        /* console.log('reportChannels table created or already exists.'); */
      }
    });
  }
});

export const saveReportChannel = (userId: string, channelId: string) => {
  db.run(`
    INSERT OR REPLACE INTO reportChannels (userId, channelId)
    VALUES (?, ?)
  `, [userId, channelId], (err) => {
    if (err) {
      console.error('Error saving report channel:', err.message);
    }
  });
};

export const getReportChannel = (userId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    db.get(`
      SELECT channelId FROM reportChannels WHERE userId = ?
    `, [userId], (err, row) => {
      if (err) {
        console.error('Error getting report channel:', err.message);
        resolve(null);
      } else {
        resolve(row ? (row as { channelId: string }).channelId : null);
      }
    });
  });
};



export const deleteReportChannel = (userId: string) => {
  db.run(`
    DELETE FROM reportChannels WHERE userId = ?
  `, [userId], (err) => {
    if (err) {
      console.error('Error deleting report channel:', err.message);
    }
  });
};
export default db;
