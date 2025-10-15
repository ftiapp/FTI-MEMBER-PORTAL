import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { mssqlQuery } from "@/app/lib/mssql";
import { jwtVerify } from "jose";

export async function GET(request) {
  try {
    // Get the current user ID from the request query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ไม่ได้ระบุ userId" }, { status: 400 });
    }

    // Get all approved companies for this user with their document information
    const approvedCompanies = await query(
      `SELECT 
         c.id,
         c.user_id,
         c.MEMBER_CODE,
         c.MEMBER_DATE,
         c.company_name,
         c.company_type,
         c.tax_id,
         c.updated_at,
         c.Admin_Submit,
         c.admin_comment,
         d.file_path,
         d.file_name,
         c.COMP_PERSON_CODE,
         c.REGIST_CODE
       FROM FTI_Original_Membership c
       LEFT JOIN FTI_Original_Membership_Documents_Member d ON c.MEMBER_CODE = d.MEMBER_CODE AND d.Admin_Submit = 1
       WHERE c.user_id = ? AND c.Admin_Submit = 1
       ORDER BY c.updated_at DESC`,
      [userId],
    );

    // กำหนดข้อมูลสถานะสมาชิกแบบคงที่
    // เนื่องจากการเชื่อมต่อกับฐานข้อมูล MSSQL มีปัญหา
    const statusCodeMap = {
      A: { name: "สมาชิก", active: 1 },
      C: { name: "ยกเลิกสมาชิก", active: 1 },
      D: { name: "สมาชิกลบชื่อ", active: 1 },
      N: { name: "ค้างชำระค่าสมาชิก", active: 1 },
      O: { name: "ยกเลิกสมาชิก/ค้างชำระ", active: 1 },
      P: { name: "รออนุมัติยกเลิก", active: 1 },
      S: { name: "ขอคงสภาพสมาชิก", active: 1 },
      S4: { name: "3 จังหวัดภาคใต้", active: 1 },
      T: { name: "โอนย้ายสถานภาพ/โอนเลขหมาย", active: 1 },
      W: { name: "สมาชิก OTOP รอการแจ้งหนี้", active: 1 },
      X: { name: "รออนุมัติสมาชิก", active: 1 },
    };

    // ดึงข้อมูลสถานะสมาชิกจาก MSSQL
    const memberStatusMap = {};

    try {
      // ดึงข้อมูลสมาชิกจากตาราง MB_MEMBER สำหรับบริษัทที่มีในผลลัพธ์
      if (approvedCompanies.length > 0) {
        // กรองเฉพาะบริษัทที่มีทั้ง COMP_PERSON_CODE และ REGIST_CODE
        const validCompanies = approvedCompanies.filter(
          (company) => company.COMP_PERSON_CODE && company.REGIST_CODE,
        );

        if (validCompanies.length > 0) {
          // ดึงข้อมูลสถานะสมาชิกจากตาราง MB_MEMBER
          try {
            // สร้างคำสั่ง SQL ที่ใช้ทั้ง COMP_PERSON_CODE และ REGIST_CODE ในการค้นหา
            let sqlQuery = `SELECT [COMP_PERSON_CODE], [REGIST_CODE], [MEMBER_STATUS_CODE] FROM [FTI].[dbo].[MB_MEMBER] WHERE `;

            // สร้างเงื่อนไขสำหรับแต่ละบริษัท
            const conditions = [];
            const params = [];
            let paramIndex = 0;

            validCompanies.forEach((company) => {
              conditions.push(
                `(COMP_PERSON_CODE = @param${paramIndex} AND REGIST_CODE = @param${paramIndex + 1})`,
              );
              params.push(company.COMP_PERSON_CODE, company.REGIST_CODE);
              paramIndex += 2;
            });

            sqlQuery += conditions.join(" OR ");

            console.log("SQL Query:", sqlQuery);
            console.log("Params:", params);

            const memberResult = await mssqlQuery(sqlQuery, params);

            // สร้าง map ของ COMP_PERSON_CODE+REGIST_CODE และสถานะสมาชิก
            if (memberResult && memberResult.recordset) {
              memberResult.recordset.forEach((member) => {
                // ใช้ทั้ง COMP_PERSON_CODE และ REGIST_CODE เป็น key
                const key = `${member.COMP_PERSON_CODE}_${member.REGIST_CODE}`;
                memberStatusMap[key] = {
                  statusCode: member.MEMBER_STATUS_CODE,
                  statusName: statusCodeMap[member.MEMBER_STATUS_CODE]?.name || "ไม่ทราบสถานะ",
                  active: statusCodeMap[member.MEMBER_STATUS_CODE]?.active || 0,
                };
              });
            } else {
              console.log("No member records found or recordset is undefined");

              // ในกรณีที่ไม่สามารถดึงข้อมูลได้ ให้กำหนดสถานะเป็น สมาชิก
              validCompanies.forEach((company) => {
                const key = `${company.COMP_PERSON_CODE}_${company.REGIST_CODE}`;
                memberStatusMap[key] = {
                  statusCode: "A",
                  statusName: "สมาชิก",
                  active: 1,
                };
              });
            }
          } catch (memberError) {
            console.error("Error fetching member data from MSSQL:", memberError);

            // ในกรณีที่เกิดข้อผิดพลาด ให้กำหนดสถานะเป็น สมาชิก
            validCompanies.forEach((company) => {
              const key = `${company.COMP_PERSON_CODE}_${company.REGIST_CODE}`;
              memberStatusMap[key] = {
                statusCode: "A",
                statusName: "สมาชิก",
                active: 1,
              };
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching member status from MSSQL:", error);
    }

    // เพิ่มข้อมูลสถานะสมาชิกเข้าไปในผลลัพธ์
    const companiesWithStatus = approvedCompanies.map((company) => {
      // สร้าง key จากทั้ง COMP_PERSON_CODE และ REGIST_CODE
      const key =
        company.COMP_PERSON_CODE && company.REGIST_CODE
          ? `${company.COMP_PERSON_CODE}_${company.REGIST_CODE}`
          : null;

      return {
        ...company,
        memberStatus:
          key && memberStatusMap[key]
            ? memberStatusMap[key]
            : {
                statusCode: "",
                statusName: "ไม่พบข้อมูล",
                active: 0,
              },
      };
    });

    return NextResponse.json({
      companies: companiesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching approved companies:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลบริษัทที่ได้รับการอนุมัติ" },
      { status: 500 },
    );
  }
}
