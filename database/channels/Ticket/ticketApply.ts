import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/channels/Ticket/ticketChannels.db', (err) => {
  if (err) {
    console.error('Error opening ticket channels database:', err.message);
  } else {
    /* console.log('Connected to the ticket channels database.'); */

    db.run(`
      CREATE TABLE IF NOT EXISTS ticketChannels (
        userId TEXT PRIMARY KEY,
        channelId TEXT
      )
    `, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating ticketChannels table:', createTableErr.message);
      } else {
       /* console.log('ticketChannels table created or already exists.'); */
      }
    });
  }
});

export const saveTicketChannel = (userId: string, channelId: string) => {
  db.run(`
    INSERT OR REPLACE INTO ticketChannels (userId, channelId)
    VALUES (?, ?)
  `, [userId, channelId], (err) => {
    if (err) {
      console.error('Error saving ticket channel:', err.message);
    }
  });
};

export const getTicketChannel = (userIdOrChannelId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    db.get(`
      SELECT channelId FROM ticketChannels WHERE userId = ? OR channelId = ?
    `, [userIdOrChannelId, userIdOrChannelId], (err, row) => {
      if (err) {
        console.error('Error getting ticket channel:', err.message);
        resolve(null);
      } else {
        resolve(row ? (row as { channelId: string }).channelId : null);
      }
    });
  });
};

export const deleteTicketChannel = (userId: string) => {
  db.run(`
    DELETE FROM ticketChannels WHERE userId = ?
  `, [userId], (err) => {
    if (err) {
      console.error('Error deleting ticket channel:', err.message);
    }
  });
};

export default db;
