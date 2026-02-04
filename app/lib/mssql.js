// app/lib/mssql.js

let sql = null;

async function getSql() {
  if (!sql) {
    // Use require instead of import to avoid webpack bundling
    sql = require('mssql');
  }
  return sql;
}

function getMissingEnvKeys() {
  const requiredKeys = ["MSSQL_SERVER", "MSSQL_USER", "MSSQL_PASSWORD", "MSSQL_DATABASE"];
  return requiredKeys.filter((k) => !process.env[k]);
}

const config = {
  server: process.env.MSSQL_SERVER,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;
let isConnecting = false;
let connectionPromise = null;

const MAX_RETRY_ATTEMPTS = 3;

async function getConnection(retryCount = 0) {
  const missingKeys = getMissingEnvKeys();
  if (missingKeys.length > 0) {
    throw new Error(`Missing MSSQL environment variables: ${missingKeys.join(", ")}`);
  }

  const mssql = await getSql();

  if (isConnecting && connectionPromise) {
    try {
      return await connectionPromise;
    } catch (error) {
      console.error("Error while waiting for existing connection:", error);
    }
  }

  try {
    if (pool && !pool.closed) {
      try {
        await pool.request().query("SELECT 1 AS test");
        return pool;
      } catch (testError) {
        console.warn("Connection test failed, will create new connection:", testError.message);
        try {
          await pool.close();
        } catch (closeError) {
          console.warn("Error closing pool:", closeError.message);
        }
        pool = null;
      }
    }

    isConnecting = true;
    connectionPromise = mssql.connect(config);
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
  const MAX_QUERY_RETRY = 2;
  const mssql = await getSql();

  try {
    const currentPool = await getConnection();
    const request = currentPool.request();

    request.timeout = 60000;

    if (params && params.length > 0) {
      params.forEach((param, index) => {
        if (typeof param === "string") {
          request.input(`param${index}`, mssql.NVarChar, param);
        } else if (typeof param === "number") {
          if (Number.isInteger(param)) {
            request.input(`param${index}`, mssql.Int, param);
          } else {
            request.input(`param${index}`, mssql.Float, param);
          }
        } else if (typeof param === "boolean") {
          request.input(`param${index}`, mssql.Bit, param);
        } else if (param instanceof Date) {
          request.input(`param${index}`, mssql.DateTime, param);
        } else if (param === null || param === undefined) {
          request.input(`param${index}`, mssql.NVarChar, null);
        } else {
          request.input(`param${index}`, mssql.NVarChar, String(param));
        }
      });
    }

    let modifiedQuery = queryText;
    if (params && params.length > 0) {
      params.forEach((_, index) => {
        modifiedQuery = modifiedQuery.replace("?", `@param${index}`);
      });
    }

    console.log("Executing MSSQL query:", modifiedQuery);
    const result = await request.query(modifiedQuery);

    const isStoredProcedure = /EXEC(?:UTE)?\s+/i.test(queryText);

    console.log(
      "Stored procedure result:",
      isStoredProcedure ? "Success" : "Not a stored procedure",
    );
    console.log("Recordset available:", result.recordset ? "Yes" : "No");
    console.log("Records found:", result.recordset ? result.recordset.length : 0);

    if (isStoredProcedure && queryText.includes("sp_GetMemberDetailByMemberCode_FTI_PORTAL")) {
      const memberCode = params[0];
      if (!result.recordset || result.recordset.length === 0) {
        console.log(`No records found for member code: ${memberCode}`);
      }
    }

    return result.recordset || [];
  } catch (error) {
    console.error(`MSSQL query error (attempt ${retryCount + 1}/${MAX_QUERY_RETRY + 1}):`, error);

    const isConnectionError =
      error.message.includes("Connection is closed") ||
      error.message.includes("Connection lost") ||
      error.message.includes("timeout") ||
      error.message.includes("network") ||
      error.code === "ETIMEOUT" ||
      error.code === "ECONNCLOSED";

    if (isConnectionError && retryCount < MAX_QUERY_RETRY) {
      console.log(
        `Connection error detected. Retrying query in 1 second... (attempt ${retryCount + 1})`,
      );

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
  }
}

export async function checkConnectionHealth() {
  try {
    const currentPool = await getConnection();
    const result = await currentPool.request().query("SELECT 1 AS connectionTest");
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

export const connectMSSQL = getConnection;