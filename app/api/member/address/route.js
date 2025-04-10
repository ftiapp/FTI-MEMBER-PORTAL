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

export async function GET(req) {
  let pool;
  try {
    const { searchParams } = new URL(req.url);
    const compPersonCode = searchParams.get('compPersonCode')?.trim();
    
    console.log('Fetching addresses for COMP_PERSON_CODE:', compPersonCode);

    if (!compPersonCode) {
      return NextResponse.json({
        success: false,
        message: 'รหัสบริษัท/บุคคลไม่ถูกต้อง',
        data: {
          addresses: []
        }
      }, { status: 400 });
    }

    pool = await sql.connect(config);

    const result = await pool.request()
      .input('compPersonCode', sql.NVarChar, compPersonCode)
      .query(`
        SELECT
          [COMP_PERSON_CODE],
          [ADDR_CODE],
          [ADDR_LANG],
          [ADDR_NO],
          [ADDR_MOO],
          [ADDR_SOI],
          [ADDR_ROAD],
          [ADDR_SUB_DISTRICT],
          [ADDR_DISTRICT],
          [ADDR_PROVINCE_CODE],
          [ADDR_PROVINCE_NAME],
          [ADDR_POSTCODE],
          [ADDR_TELEPHONE],
          [ADDR_FAX],
          [ADDR_WEBSITE],
          [ADDR_EMAIL],
          [ADDR_NO_EN],
          [ADDR_MOO_EN],
          [ADDR_SOI_EN],
          [ADDR_ROAD_EN],
          [ADDR_SUB_DISTRICT_EN],
          [ADDR_DISTRICT_EN],
          [ADDR_PROVINCE_CODE_EN],
          [ADDR_PROVINCE_NAME_EN],
          [ADDR_POSTCODE_EN],
          [ADDR_TELEPHONE_EN],
          [ADDR_FAX_EN],
          [ADDR_WEBSITE_EN],
          [ADDR_EMAIL_EN]
        FROM [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
        WHERE [COMP_PERSON_CODE] = @compPersonCode
        AND (ADDR_CODE = '001' OR ADDR_CODE = '002' OR ADDR_CODE = '003')
        ORDER BY ADDR_CODE
      `);
      
    console.log('Query executed successfully');
    console.log('Addresses found:', result.recordset.length);
    
    // Group addresses by ADDR_CODE for easier access in the frontend
    const addressesByCode = {};
    result.recordset.forEach(address => {
      addressesByCode[address.ADDR_CODE] = address;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        addresses: result.recordset,
        addressesByCode
      }
    });

  } catch (error) {
    console.error('Error fetching member addresses:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่',
      error: error.message
    }, { status: 500 });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('SQL connection closed');
      } catch (err) {
        console.error('Error closing SQL connection:', err);
      }
    }
  }
}
