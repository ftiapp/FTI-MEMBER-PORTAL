import mysql from 'mysql2/promise';

// Log environment variables (mask sensitive data)
console.log('Database connection attempt:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  hasPassword: !!process.env.DB_PASSWORD
});

// ตรวจสอบสภาพแวดล้อม (development หรือ production)
const isProd = process.env.NODE_ENV === 'production';

// กำหนดค่า connection ตามสภาพแวดล้อม
let dbConfig;
if (isProd) {
  // ค่าสำหรับ production environment (Kubernetes)
  dbConfig = {
    host: process.env.DB_HOST || 'ftimemberportal-rofxa-mysql.ftimemberportal-rofxa.svc.cluster.local',
    user: process.env.DB_USER || 'ermine',
    password: process.env.DB_PASSWORD || 'qZ5[oG2:wK5*zC2[',
    database: process.env.DB_NAME || 'ftimemberportal',
    port: process.env.DB_PORT || '3306',
    ssl: false
  };
} else {
  // ค่าสำหรับ development environment
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: false
  };
}

// เพิ่ม connection options
dbConfig = {
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// สร้าง connection pool
const pool = mysql.createPool(dbConfig);

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
