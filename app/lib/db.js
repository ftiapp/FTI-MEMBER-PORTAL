// Use dynamic import to avoid module parsing issues
let mysql;

// Initialize mysql connection dynamically
const initMysql = async () => {
  if (!mysql) {
    mysql = await import('mysql2/promise');
    mysql = mysql.default || mysql;
  }
  return mysql;
};

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
  connectionLimit: 20, // เพิ่มจำนวน connection ที่รองรับ
  maxIdle: 10,
  idleTimeout: 30000, // ลดเวลา idle ลงเพื่อให้ปล่อย connection เร็วขึ้น
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // เพิ่มการส่ง keepalive เร็วขึ้น
  connectTimeout: 60000, // เพิ่มเวลาในการเชื่อมต่อ
  // acquireTimeout ไม่ใช่ option ที่ถูกต้องสำหรับ mysql2
};

// Create connection pool with dynamic import
let pool;

const initPool = async () => {
  if (!pool) {
    const mysqlModule = await initMysql();
    pool = mysqlModule.createPool(dbConfig);
  }
  return pool;
};

// Test connection on startup with retry
async function testConnection() {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const connectionPool = await initPool();
      const connection = await connectionPool.getConnection();
      console.log('Database connection successful');
      connection.release();
      return true;
    } catch (err) {
      retryCount++;
      console.error(`Error connecting to the database (attempt ${retryCount}/${maxRetries}):`, {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage
      });
      
      if (retryCount < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All connection attempts failed');
      }
    }
  }
  
  return false;
}

// Run the test connection
testConnection();

// Helper function สำหรับ execute queries with retry
// Export the query function
export async function query(sql, params) {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < maxRetries) {
    let connection;
    try {
      const connectionPool = await initPool();
      connection = await connectionPool.getConnection();
      // ตรวจสอบว่า sql เป็น object หรือไม่ (กรณีที่เรียกใช้แบบ {query: '...', values: [...]})  
      const queryString = sql.query || sql;
      const queryParams = sql.values || params;
      
      console.log(`Executing query (attempt ${retryCount + 1}/${maxRetries}):`, {
        sql: queryString,
        params: queryParams
      });
      
      try {
        // ใช้ query แทน execute เพื่อรองรับ LIMIT และ OFFSET ใน prepared statements
        const [results] = await connection.query(queryString, queryParams);
        return results;
      } finally {
        // Always release the connection back to the pool
        connection.release();
      }
    } catch (error) {
      lastError = error;
      
      // Log the error
      console.error(`Query error (attempt ${retryCount + 1}/${maxRetries}):`, {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        sql: sql,
        params: params
      });
      
      // Only retry on connection errors (like ECONNRESET)
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }
  
  // If we got here, all retries failed or it wasn't a retryable error
  throw lastError;
}

/**
 * เริ่มต้น transaction
 * @returns {Promise<Object>} Connection object with transaction
 */
export async function beginTransaction() {
  const connectionPool = await initPool();
  const connection = await connectionPool.getConnection();
  try {
    await connection.beginTransaction();
    return connection;
  } catch (error) {
    connection.release();
    throw error;
  }
}

/**
 * Execute query with a specific connection (for transactions)
 * @param {Object} connection - Connection object
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(connection, sql, params) {
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', {
      message: error.message,
      code: error.code,
      sql: sql,
      params: params
    });
    throw error;
  }
}

/**
 * Commit transaction
 * @param {Object} connection - Connection object with active transaction
 * @returns {Promise<void>}
 */
export async function commitTransaction(connection) {
  try {
    await connection.commit();
  } finally {
    connection.release();
  }
}

/**
 * Rollback transaction
 * @param {Object} connection - Connection object with active transaction
 * @returns {Promise<void>}
 */
export async function rollbackTransaction(connection) {
  try {
    await connection.rollback();
  } finally {
    connection.release();
  }
}

/**
 * Get a connection from the pool
 * @returns {Promise<Object>} Database connection
 */
export async function getConnection() {
  const connectionPool = await initPool();
  return await connectionPool.getConnection();
}

/**
 * ฟังก์ชันสำหรับ query ที่ไม่ต้องใช้ transaction
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function executeQueryWithoutTransaction(sql, params) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', { sql, params, error });
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Function to get a database connection
// @returns {Promise<Object>} Database connection
export async function connectDB() {
  try {
    return await getConnection();
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Export the initPool function for direct use in API routes
export { initPool };
