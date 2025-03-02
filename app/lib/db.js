import mysql from 'mysql2/promise';

// Log environment variables (mask sensitive data)
console.log('Database connection attempt:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  hasPassword: !!process.env.DB_PASSWORD
});

// สร้าง connection string แบบไม่ใช้ SSL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: false,  // ปิดการใช้งาน SSL
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
    console.error('Error connecting to the database:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
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
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: sql,
      params: params
    });
    throw error;
  }
}
