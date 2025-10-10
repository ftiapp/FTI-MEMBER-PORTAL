import sql from "mssql";

// ตรวจสอบว่ามี environment variables ครบถ้วน
if (!process.env.MSSQL_SERVER) {
  throw new Error("MSSQL_SERVER environment variable is not set");
}
if (!process.env.MSSQL_USER) {
  throw new Error("MSSQL_USER environment variable is not set");
}
if (!process.env.MSSQL_PASSWORD) {
  throw new Error("MSSQL_PASSWORD environment variable is not set");
}
if (!process.env.MSSQL_DATABASE) {
  throw new Error("MSSQL_DATABASE environment variable is not set");
}

const config = {
  server: process.env.MSSQL_SERVER,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true, // เปิดการเข้ารหัสการเชื่อมต่อ
    trustServerCertificate: true, // ยอมรับใบรับรองจากเซิร์ฟเวอร์
    connectTimeout: 30000, // Increase connection timeout
    requestTimeout: 60000, // Increase request timeout for long-running queries
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;
let isConnecting = false;
let connectionPromise = null;

// Maximum number of connection retry attempts
const MAX_RETRY_ATTEMPTS = 3;

async function getConnection(retryCount = 0) {
  // If we're already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    try {
      return await connectionPromise;
    } catch (error) {
      console.error("Error while waiting for existing connection:", error);
      // Continue to retry logic
    }
  }

  try {
    // Check if pool exists and is connected
    if (pool && !pool.closed) {
      try {
        // Test the connection with a simple query
        await pool.request().query("SELECT 1 AS test");
        return pool;
      } catch (testError) {
        console.warn("Connection test failed, will create new connection:", testError.message);
        // Connection test failed, close the pool and create a new one
        try {
          await pool.close();
        } catch (closeError) {
          console.warn("Error closing pool:", closeError.message);
        }
        pool = null;
      }
    }

    // Create a new connection
    isConnecting = true;
    connectionPromise = sql.connect(config);
    pool = await connectionPromise;
    console.log("MSSQL connection pool created successfully");
    isConnecting = false;
    connectionPromise = null;
    return pool;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    console.error(
      `MSSQL connection error (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}):`,
      error,
    );

    // Retry logic
    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      console.log(`Retrying connection in 1 second... (attempt ${retryCount + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getConnection(retryCount + 1);
    }

    throw new Error(
      `Failed to connect to database after ${MAX_RETRY_ATTEMPTS} attempts: ${error.message}`,
    );
  }
}

export async function mssqlQuery(queryText, params = [], retryCount = 0) {
  const MAX_QUERY_RETRY = 2; // Maximum number of query retry attempts

  try {
    // Get a connection from the pool with retry logic built in
    const pool = await getConnection();
    const request = pool.request();

    // Set timeout for this specific request
    request.timeout = 60000; // 60 seconds timeout for long queries

    // Add parameters to the request
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        // ระบุประเภทข้อมูลตามค่าของพารามิเตอร์
        if (typeof param === "string") {
          request.input(`param${index}`, sql.NVarChar, param);
        } else if (typeof param === "number") {
          if (Number.isInteger(param)) {
            request.input(`param${index}`, sql.Int, param);
          } else {
            request.input(`param${index}`, sql.Float, param);
          }
        } else if (typeof param === "boolean") {
          request.input(`param${index}`, sql.Bit, param);
        } else if (param instanceof Date) {
          request.input(`param${index}`, sql.DateTime, param);
        } else if (param === null || param === undefined) {
          request.input(`param${index}`, sql.NVarChar, null);
        } else {
          // ถ้าไม่รู้จักประเภทข้อมูล ให้ใช้ NVarChar
          request.input(`param${index}`, sql.NVarChar, String(param));
        }
      });
    }

    // Replace ? with @param0, @param1, etc.
    let modifiedQuery = queryText;
    if (params && params.length > 0) {
      params.forEach((_, index) => {
        modifiedQuery = modifiedQuery.replace("?", `@param${index}`);
      });
    }

    console.log("Executing MSSQL query:", modifiedQuery);
    const result = await request.query(modifiedQuery);

    // Check if this is a stored procedure call (contains EXEC or EXECUTE)
    const isStoredProcedure = /EXEC(?:UTE)?\s+/i.test(queryText);

    // Enhanced logging for debugging stored procedure results
    console.log(
      "Stored procedure result:",
      isStoredProcedure ? "Success" : "Not a stored procedure",
    );
    console.log("Recordset available:", result.recordset ? "Yes" : "No");
    console.log("Records found:", result.recordset ? result.recordset.length : 0);

    // For stored procedures, especially member detail queries
    if (isStoredProcedure && queryText.includes("sp_GetMemberDetailByMemberCode_FTI_PORTAL")) {
      const memberCode = params[0];
      if (!result.recordset || result.recordset.length === 0) {
        console.log(`No records found for member code: ${memberCode}`);
      }
    }

    // Return the recordset or an empty array if no recordset
    return result.recordset || [];
  } catch (error) {
    console.error(`MSSQL query error (attempt ${retryCount + 1}/${MAX_QUERY_RETRY + 1}):`, error);

    // Check if this is a connection-related error
    const isConnectionError =
      error.message.includes("Connection is closed") ||
      error.message.includes("Connection lost") ||
      error.message.includes("timeout") ||
      error.message.includes("network") ||
      error.code === "ETIMEOUT" ||
      error.code === "ECONNCLOSED";

    // Retry logic for connection errors
    if (isConnectionError && retryCount < MAX_QUERY_RETRY) {
      console.log(
        `Connection error detected. Retrying query in 1 second... (attempt ${retryCount + 1})`,
      );

      // Reset the pool to force a new connection on retry
      if (pool) {
        try {
          await pool.close();
        } catch (closeError) {
          console.warn("Error closing pool during retry:", closeError.message);
        }
        pool = null;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mssqlQuery(queryText, params, retryCount + 1);
    }

    throw error;
  }
}

export async function closeMssqlPool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("MSSQL connection pool closed");
    }
  } catch (error) {
    console.error("Error closing MSSQL connection pool:", error);
    // Don't throw the error, just log it
    // This prevents issues when closing during server shutdown
  }
}

// Function to check connection health
export async function checkConnectionHealth() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT 1 AS connectionTest");
    return {
      healthy: true,
      message: "Database connection is healthy",
      details: result.recordset[0],
    };
  } catch (error) {
    return {
      healthy: false,
      message: "Database connection is unhealthy",
      error: error.message,
    };
  }
}

// Export getConnection as connectMSSQL for compatibility with connect route
export const connectMSSQL = getConnection;
