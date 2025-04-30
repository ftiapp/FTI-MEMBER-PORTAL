import sql from 'mssql';

const config = {
  server: process.env.MSSQL_SERVER || '203.151.40.31',
  user: process.env.MSSQL_USER || 'itadmin',
  password: process.env.MSSQL_PASSWORD || 'It#11044',
  database: process.env.MSSQL_DATABASE || 'FTI',
  options: {
    encrypt: false, // ไม่ใช้การเข้ารหัส
    trustServerCertificate: true, // ยอมรับใบรับรองจากเซิร์ฟเวอร์
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('MSSQL connection pool created');
    }
    return pool;
  } catch (error) {
    console.error('MSSQL connection error:', error);
    throw error;
  }
}

export async function mssqlQuery(queryText, params = []) {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters to the request
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        // ระบุประเภทข้อมูลตามค่าของพารามิเตอร์
        if (typeof param === 'string') {
          request.input(`param${index}`, sql.NVarChar, param);
        } else if (typeof param === 'number') {
          if (Number.isInteger(param)) {
            request.input(`param${index}`, sql.Int, param);
          } else {
            request.input(`param${index}`, sql.Float, param);
          }
        } else if (typeof param === 'boolean') {
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
        modifiedQuery = modifiedQuery.replace('?', `@param${index}`);
      });
    }
    
    console.log('Executing MSSQL query:', modifiedQuery);
    const result = await request.query(modifiedQuery);
    
    // Check if this is a stored procedure call (contains EXEC or EXECUTE)
    const isStoredProcedure = /EXEC(?:UTE)?\s+/i.test(queryText);
    
    // Enhanced logging for debugging stored procedure results
    console.log('Stored procedure result:', isStoredProcedure ? 'Success' : 'Not a stored procedure');
    console.log('Recordset available:', result.recordset ? 'Yes' : 'No');
    console.log('Records found:', result.recordset ? result.recordset.length : 0);
    
    // For stored procedures, especially member detail queries
    if (isStoredProcedure && queryText.includes('sp_GetMemberDetailByMemberCode_FTI_PORTAL')) {
      const memberCode = params[0];
      if (!result.recordset || result.recordset.length === 0) {
        console.log(`No records found for member code: ${memberCode}`);
      }
    }
    
    // Return the recordset or an empty array if no recordset
    return result.recordset || [];
  } catch (error) {
    console.error('MSSQL query error:', error);
    throw error;
  }
}

export async function closeMssqlPool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('MSSQL connection pool closed');
    }
  } catch (error) {
    console.error('Error closing MSSQL connection pool:', error);
    throw error;
  }
}
