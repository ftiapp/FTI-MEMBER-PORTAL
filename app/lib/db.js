import mysql from 'mysql2/promise';

const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('Database connection string:', connectionString.replace(process.env.DB_PASSWORD, '****'));

const pool = mysql.createPool({
  uri: connectionString,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Database connection successful');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Helper function สำหรับ execute queries
export async function query(sql, params) {
  try {
    console.log('Executing query:', {
      sql: sql,
      params: params
    });
    
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', {
      message: error.message,
      code: error.code,
      sql: sql,
      params: params
    });
    throw error;
  }
}
