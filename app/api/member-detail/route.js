import { NextResponse } from 'next/server';
import { mssqlQuery } from '@/app/lib/mssql';

/**
 * API endpoint to fetch member details by member code using the stored procedure
 * @param {Object} request The request object
 * @returns {Object} JSON response with member details
 */
export async function GET(request) {
  try {
    // Get member code from query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('memberCode');
    
    if (!memberCode) {
      return NextResponse.json(
        { error: 'ไม่ได้ระบุรหัสสมาชิก' },
        { status: 400 }
      );
    }
    
    console.log('Fetching member details for member code:', memberCode);
    
    let result;
    try {
      // Execute the stored procedure
      console.log(`Executing stored procedure with member_code: ${memberCode}`);
      result = await mssqlQuery(`EXEC [dbo].[sp_GetMemberDetailByMemberCode_FTI_PORTAL] @member_code = @param0`, [memberCode]);
      
      if (!result || result.length === 0) {
        console.log('No records found for member code:', memberCode);
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลสมาชิก', memberCode },
          { status: 404 }
        );
      }
    } catch (spError) {
      console.error('Error executing stored procedure:', spError);
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการเรียกใช้ stored procedure', details: spError.message },
        { status: 500 }
      );
    }
    
    // Group the results by REGIST_CODE to handle multiple addresses for the same company
    const groupedResults = {};
    
    result.forEach(record => {
      const registCode = record.REGIST_CODE;
      
      if (!groupedResults[registCode]) {
        groupedResults[registCode] = {
          companyInfo: {
            COMPANY_NAME: record.COMPANY_NAME,
            COMP_PERSON_NAME_EN: record.COMP_PERSON_NAME_EN,
            MEMBER_CODE: record.MEMBER_CODE,
            REGIST_CODE: record.REGIST_CODE,
            COMP_PERSON_CODE: record.COMP_PERSON_CODE,
            TAX_ID: record.TAX_ID,
            MEMBER_MAIN_GROUP_CODE: record.MEMBER_MAIN_GROUP_CODE,
            MEMBER_GROUP_CODE: record.MEMBER_GROUP_CODE,
            MEMBER_STATUS_CODE: record.MEMBER_STATUS_CODE,
            MEMBER_TYPE_CODE: record.MEMBER_TYPE_CODE,
            Right_GROUP_NAME: record.Right_GROUP_NAME,
            Right_GROUP_NAME_EN: record.Right_GROUP_NAME_EN,
            Industry_GROUP_NAME: record.Industry_GROUP_NAME,
            Industry_GROUP_NAME_EN: record.Industry_GROUP_NAME_EN,
            Province_GROUP_NAME: record.Province_GROUP_NAME,
            Province_GROUP_NAME_EN: record.Province_GROUP_NAME_EN,
            PRODUCT_DESC_TH: record.PRODUCT_DESC_TH,
            PRODUCT_DESC_EN: record.PRODUCT_DESC_EN
          },
          addresses: {},
          representatives: {
            right: [
              { th: record.Right_REPRESENT_1, en: record.Right_REPRESENT_1_EN },
              { th: record.Right_REPRESENT_2, en: record.Right_REPRESENT_2_EN },
              { th: record.Right_REPRESENT_3, en: record.Right_REPRESENT_3_EN }
            ],
            industry: [
              { th: record.Industry_REPRESENT_1, en: record.Industry_REPRESENT_1_EN },
              { th: record.Industry_REPRESENT_2, en: record.Industry_REPRESENT_2_EN },
              { th: record.Industry_REPRESENT_3, en: record.Industry_REPRESENT_3_EN }
            ],
            province: [
              { th: record.Province_REPRESENT_1, en: record.Province_REPRESENT_1_EN },
              { th: record.Province_REPRESENT_2, en: record.Province_REPRESENT_2_EN },
              { th: record.Province_REPRESENT_3, en: record.Province_REPRESENT_3_EN }
            ]
          }
        };
      }
      
      // Add address information based on ADDR_CODE
      groupedResults[registCode].addresses[record.ADDR_CODE] = {
        ADDR_CODE: record.ADDR_CODE,
        ADDR_NO: record.ADDR_NO,
        ADDR_MOO: record.ADDR_MOO,
        ADDR_SOI: record.ADDR_SOI,
        ADDR_ROAD: record.ADDR_ROAD,
        ADDR_SUB_DISTRICT: record.ADDR_SUB_DISTRICT,
        ADDR_DISTRICT: record.ADDR_DISTRICT,
        ADDR_PROVINCE_NAME: record.ADDR_PROVINCE_NAME,
        ADDR_POSTCODE: record.ADDR_POSTCODE,
        ADDR_TELEPHONE: record.ADDR_TELEPHONE,
        ADDR_FAX: record.ADDR_FAX,
        ADDR_FAX_EN: record.ADDR_FAX_EN,
        ADDR_EMAIL: record.ADDR_EMAIL,
        ADDR_NO_EN: record.ADDR_NO_EN,
        ADDR_MOO_EN: record.ADDR_MOO_EN,
        ADDR_SOI_EN: record.ADDR_SOI_EN,
        ADDR_ROAD_EN: record.ADDR_ROAD_EN,
        ADDR_SUB_DISTRICT_EN: record.ADDR_SUB_DISTRICT_EN,
        ADDR_DISTRICT_EN: record.ADDR_DISTRICT_EN,
        ADDR_PROVINCE_NAME_EN: record.ADDR_PROVINCE_NAME_EN,
        ADDR_POSTCODE_EN: record.ADDR_POSTCODE_EN,
        ADDR_TELEPHONE_EN: record.ADDR_TELEPHONE_EN,
        ADDR_EMAIL_EN: record.ADDR_EMAIL_EN,
        ADDR_WEBSITE: record.ADDR_WEBSITE
      };
    });
    
    return NextResponse.json({
      success: true,
      data: groupedResults
    });
    
  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก', details: error.message },
      { status: 500 }
    );
  }
}
