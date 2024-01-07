// ./database/voice/voice.ts
import sqlite3 from 'sqlite3';

const voiceDb = new sqlite3.Database('./database/voice/voice.db', (err) => {
  if (err) {
    console.error('Error opening voice database:', err.message);
  } else {
    /* console.log('Connected to the voice database.'); */

    voiceDb.run(
      `
      CREATE TABLE IF NOT EXISTS voiceTime (
        userId TEXT PRIMARY KEY,
        totalVoiceTime INTEGER DEFAULT 0,
        lastUpdateTime INTEGER DEFAULT 0
      )
      `,
      (createTableErr) => {
        if (createTableErr) {
          console.error('Error creating voiceTime table:', createTableErr.message);
        } else {
         /* console.log('voiceTime table created or already exists.'); */
        }
      }
    );
  }
});

export const updateVoiceTime = (userId: string, timeSpent: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000); // convert milliseconds to seconds
  
      voiceDb.run(
        `
        INSERT OR REPLACE INTO voiceTime (userId, totalVoiceTime, lastUpdateTime)
        VALUES (?, COALESCE((SELECT totalVoiceTime FROM voiceTime WHERE userId = ?), 0) + ?, COALESCE((SELECT lastUpdateTime FROM voiceTime WHERE userId = ?), ?)), ?
        `,
        [userId, userId, timeSpent, userId, timeSpent, currentTimeInSeconds],
        (err) => {
          if (err) {
            console.error('Error updating voice time:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  };
  
  
  
  

export const getTotalVoiceTime = (callback: (totalVoiceTime: number) => void) => {
  voiceDb.get(
    `
    SELECT SUM(totalVoiceTime) as total FROM voiceTime
    `,
    (err, row) => {
      if (err) {
        console.error('Error getting total voice time:', err.message);
        callback(0);
      } else {
        callback(row ? (row as { total: number }).total : 0);
      }
    }
  );
};

export const getLastUpdateTime = (userId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    voiceDb.get(
      `
      SELECT lastUpdateTime FROM voiceTime
      WHERE userId = ?
      `,
      [userId],
      (err, row: { lastUpdateTime?: number }) => {
        if (err) {
          console.error('Error getting last update time:', err.message);
          reject(err);
        } else {
          resolve(row ? row.lastUpdateTime || 0 : 0);
        }
      }
    );
  });
};

export const getTopUsersFromDatabase = (): Promise<[string, number][]> => {
  return new Promise((resolve) => {
    voiceDb.all(
      `
      SELECT userId, totalVoiceTime FROM voiceTime
      ORDER BY totalVoiceTime DESC
      LIMIT 10
      `,
      (err, rows: { userId: string; totalVoiceTime: number }[]) => {
        if (err) {
          console.error('Error fetching top users from database:', err.message);
          resolve([]);
        } else {
          const topUsers = rows.map((row) => [row.userId, row.totalVoiceTime] as [string, number]);
          resolve(topUsers);
        }
      }
    );
  });
};

export default voiceDb;
