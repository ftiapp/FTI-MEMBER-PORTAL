import sql from 'mssql';
import { NextResponse } from 'next/server';

// Database configuration
const config = {
  user: 'itadmin',
  password: 'It#11044',
  server: '203.151.40.31',
  database: 'FTI',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Log the configuration for debugging (without password)
console.log('Database config:', {
  user: config.user,
  server: config.server,
  database: config.database
});

export async function GET(req) {
  let pool;
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('term')?.trim() || '';
    
    console.log('Search term:', searchTerm);

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          companies: []
        }
      });
    }

    pool = await sql.connect(config);

    const searchPattern = `%${searchTerm}%`;
    const startWithPattern = `${searchTerm}%`;
    
    console.log('Search patterns:', { searchPattern, startWithPattern });
    
    const result = await pool.request()
      .input('searchPattern', sql.NVarChar, searchPattern)
      .input('startWithPattern', sql.NVarChar, startWithPattern)
      .query(`
        SELECT TOP 10 
          [REGIST_CODE],
          [MEMBER_CODE],
          [MEMBER_TYPE_CODE],
          [COMP_PERSON_CODE],
          [TAX_ID],
          [COMPANY_NAME],         -- Includes prename
          [COMPANY_NAME_TH],      -- Plain company name (Thai)
          [COMP_PERSON_NAME_EN]   -- English name if needed
        FROM [FTI].[dbo].[BI_MEMBER]
        WHERE [MEMBER_STATUS_CODE] = 'A'
          AND [MEMBER_MAIN_GROUP_CODE] = '000'
          AND (
            [MEMBER_CODE] LIKE @searchPattern OR
            [COMPANY_NAME_TH] LIKE @searchPattern OR
            [COMPANY_NAME] LIKE @searchPattern
          )
        ORDER BY
          CASE
            WHEN [COMPANY_NAME_TH] LIKE @startWithPattern THEN 1
            WHEN [COMPANY_NAME] LIKE @startWithPattern THEN 2
            WHEN [MEMBER_CODE] LIKE @startWithPattern THEN 3
            ELSE 4
          END,
          CHARINDEX(@searchPattern, [COMPANY_NAME_TH]),
          [COMPANY_NAME_TH]
      `);
      
    console.log('Query executed successfully');
    
    console.log('Records found:', result.recordset.length);
    if (result.recordset.length > 0) {
      console.log('Sample record:', result.recordset[0]);
    }
    
    // Map member type codes to their display values
    const mappedResults = result.recordset.map(record => {
      let memberType = '';
      switch(record.MEMBER_TYPE_CODE) {
        case '11': memberType = 'สน'; break;
        case '12': memberType = 'สส'; break;
        case '21': memberType = 'ทน'; break;
        case '22': memberType = 'ทบ'; break;
        default: memberType = record.MEMBER_TYPE_CODE;
      }
      
      return {
        ...record,
        MEMBER_TYPE: memberType,
        MEMBER_TYPE_CODE: record.MEMBER_TYPE_CODE
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        companies: mappedResults
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch member data',
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}