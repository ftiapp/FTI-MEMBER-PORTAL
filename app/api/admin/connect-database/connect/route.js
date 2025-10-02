import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../../lib/adminAuth";
import { connectDB } from "../../../../lib/db";
import { connectMSSQL } from "../../../../lib/mssql";
import { sendMemberConnectionEmail } from "../../../../lib/postmark";

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { memberId, memberType, taxId } = await request.json();

    if (!memberId || !memberType || !taxId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    // เชื่อมต่อ MSSQL เพื่อค้นหา MEMBER_CODE และข้อมูลอ้างอิง
    const mssqlConnection = await connectMSSQL();

    const mssqlQuery = `
      SELECT [MEMBER_CODE], [REGIST_CODE], [COMP_PERSON_CODE], [COMPANY_NAME], 
             [MEMBER_MAIN_TYPE_CODE], [MEMBER_TYPE_CODE], [TAX_ID]
      FROM [FTI].[dbo].[FTI_MEMBER_PORTAL]
      WHERE [TAX_ID] = @taxId
    `;

    const mssqlResult = await mssqlConnection.request().input("taxId", taxId).query(mssqlQuery);

    if (mssqlResult.recordset.length === 0) {
      await mssqlConnection.close();
      return NextResponse.json(
        { message: "ไม่พบข้อมูลสมาชิกในระบบหลัก กรุณาตรวจสอบเลขประจำตัวผู้เสียภาษี" },
        { status: 404 },
      );
    }

    const memberData = mssqlResult.recordset[0];
    const memberCode = memberData.MEMBER_CODE;

    // ดึง MEMBER_DATE จากตารางหลักถ้ามี
    let memberDate = null;
    try {
      const mdQuery = `
        SELECT [MEMBER_DATE]
        FROM [FTI].[dbo].[MB_MEMBER]
        WHERE [COMP_PERSON_CODE] = @cpc AND [REGIST_CODE] = @rc
      `;
      const mdRes = await mssqlConnection
        .request()
        .input("cpc", memberData.COMP_PERSON_CODE)
        .input("rc", memberData.REGIST_CODE)
        .query(mdQuery);
      if (mdRes.recordset && mdRes.recordset[0] && mdRes.recordset[0].MEMBER_DATE) {
        const d = new Date(mdRes.recordset[0].MEMBER_DATE);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          memberDate = `${yyyy}-${mm}-${dd}`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch MEMBER_DATE from MSSQL for connect flow:", e);
    }

    await mssqlConnection.close();

    // เชื่อมต่อ MySQL เพื่ออัปเดตข้อมูล
    const mysqlConnection = await connectDB();

    try {
      await mysqlConnection.beginTransaction();

      // อัปเดต member_code ในตารางที่เกี่ยวข้อง
      const updateTableQuery = `
        UPDATE MemberRegist_${memberType}_Main 
        SET member_code = ?, updated_at = NOW()
        WHERE id = ? AND status = 1
      `;

      await mysqlConnection.execute(updateTableQuery, [memberCode, memberId]);

      // ดึงข้อมูลสมาชิกเพื่อใส่ใน companies_Member
      const getMemberQuery = `
        SELECT * FROM MemberRegist_${memberType}_Main WHERE id = ?
      `;

      const [memberRows] = await mysqlConnection.execute(getMemberQuery, [memberId]);

      if (memberRows.length === 0) {
        throw new Error("Member not found");
      }

      const member = memberRows[0];

      // ตรวจสอบว่ามีข้อมูลใน companies_Member แล้วหรือไม่
      const checkExistingQuery = `
        SELECT id FROM companies_Member 
        WHERE MEMBER_CODE = ? OR tax_id = ?
      `;

      const [existingRows] = await mysqlConnection.execute(checkExistingQuery, [memberCode, taxId]);

      if (existingRows.length === 0) {
        // แปลงรหัสประเภทสมาชิกเป็นตัวย่อภาษาไทย
        let thaiMemberType = "";
        switch (memberType) {
          case "OC":
            thaiMemberType = "สน";
            break;
          case "IC":
            thaiMemberType = "ทบ";
            break;
          case "AM":
            thaiMemberType = "สส";
            break;
          case "AC":
            thaiMemberType = "ทน";
            break;
          default:
            thaiMemberType = memberType || "";
        }

        // เพิ่มข้อมูลใหม่ใน companies_Member
        const insertCompanyQuery = `
          INSERT INTO companies_Member (
            user_id, MEMBER_CODE, COMP_PERSON_CODE, REGIST_CODE, MEMBER_DATE,
            company_name, company_type, tax_id, Admin_Submit,
            admin_id, admin_name, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW(), NOW())
        `;

        await mysqlConnection.execute(insertCompanyQuery, [
          member.user_id || null,
          memberCode || null,
          memberData.COMP_PERSON_CODE || "",
          memberData.REGIST_CODE || "",
          memberDate || null,
          member.company_name_th || member.company_name_en || "",
          thaiMemberType,
          taxId || "",
          admin.id || null,
          admin.username || admin.name || "",
        ]);
      } else {
        // แปลงรหัสประเภทสมาชิกเป็นตัวย่อภาษาไทย
        let thaiMemberType = "";
        switch (memberType) {
          case "OC":
            thaiMemberType = "สน";
            break;
          case "IC":
            thaiMemberType = "ทบ";
            break;
          case "AM":
            thaiMemberType = "สส";
            break;
          case "AC":
            thaiMemberType = "ทน";
            break;
          default:
            thaiMemberType = memberType || "";
        }

        // อัปเดตข้อมูลที่มีอยู่แล้ว
        const updateCompanyQuery = `
          UPDATE companies_Member 
          SET MEMBER_CODE = ?, COMP_PERSON_CODE = ?, REGIST_CODE = ?,
              MEMBER_DATE = IFNULL(MEMBER_DATE, ?),
              company_type = ?, Admin_Submit = 1, admin_id = ?, admin_name = ?, updated_at = NOW()
          WHERE tax_id = ?
        `;

        await mysqlConnection.execute(updateCompanyQuery, [
          memberCode || null,
          memberData.COMP_PERSON_CODE || "",
          memberData.REGIST_CODE || "",
          memberDate || null,
          thaiMemberType,
          admin.id || null,
          admin.username || admin.name || "",
          taxId || "",
        ]);
      }

      // บันทึก log การดำเนินการ
      const logQuery = `
        INSERT INTO admin_actions_log (
          admin_id, action_type, target_id, description, 
          ip_address, user_agent, created_at
        ) VALUES (?, 'other', ?, ?, ?, ?, NOW())
      `;

      const clientIP =
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      const logDescription = JSON.stringify({
        MEMBER_CODE: memberCode,
        TAX_ID: taxId,
        COMPANY_NAME: member.company_name_th || member.company_name_en || "",
        USER_ID: member.user_id || null,
        member_type: memberType,
        admin_name: admin.username || admin.name || "",
      });

      await mysqlConnection.execute(logQuery, [
        admin.id,
        memberId,
        logDescription,
        clientIP,
        userAgent,
      ]);

      // อัปเดต role ผู้ใช้: ถ้าเป็น default_user ให้เลื่อนเป็น member หลังเชื่อมต่อสำเร็จ
      try {
        if (member.user_id) {
          const promoteRoleQuery = `
            UPDATE users
            SET role = 'member', updated_at = NOW()
            WHERE id = ? AND role = 'default_user'
          `;
          await mysqlConnection.execute(promoteRoleQuery, [member.user_id]);
        }
      } catch (roleErr) {
        console.error("Failed to promote user role after connect:", roleErr);
        // ไม่ต้อง throw เพื่อไม่ให้ล้มทั้งทรานแซกชันถ้าเปลี่ยน role ไม่ได้
      }

      await mysqlConnection.commit();

      // ส่งอีเมลแจ้งเตือนและสร้างการแจ้งเตือนในระบบหลังจากเชื่อมต่อสำเร็จ
      try {
        if (member.user_id) {
          // ดึงข้อมูลผู้ใช้จากตาราง users
          const getUserQuery = `SELECT email, firstname, lastname FROM users WHERE id = ?`;
          const [userRows] = await mysqlConnection.execute(getUserQuery, [member.user_id]);

          if (userRows.length > 0) {
            const user = userRows[0];
            const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;

            // ข้อมูลสำหรับส่งอีเมล
            const emailMemberData = {
              company_name:
                member.company_name_th || member.company_name_en || memberData.COMPANY_NAME || "",
              tax_id: taxId,
              member_code: memberCode,
              member_type: memberType,
            };

            // ส่งอีเมลแจ้งเตือน
            await sendMemberConnectionEmail(user.email, userName, emailMemberData);
            console.log(`Email notification sent to ${user.email} for member code ${memberCode}`);

            // สร้างการแจ้งเตือนในระบบ
            const companyName =
              member.company_name_th || member.company_name_en || memberData.COMPANY_NAME || "";
            const notificationMessage = `หมายเลขสมาชิก ${memberCode} ${companyName} เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยเรียบร้อยแล้ว`;
            const insertNotificationQuery = `
              INSERT INTO notifications (user_id, type, message, member_code, link, status, created_at, updated_at)
              VALUES (?, 'member_connection', ?, ?, ?, 'approved', NOW(), NOW())
            `;

            await mysqlConnection.execute(insertNotificationQuery, [
              member.user_id,
              notificationMessage,
              memberCode || "",
              "/dashboard?tab=member",
            ]);

            console.log(
              `Notification created for user ${member.user_id} for member code ${memberCode}`,
            );
          }
        }
      } catch (notificationError) {
        // Log error but don't fail the main operation
        console.error("Failed to create notification:", notificationError);
      }

      return NextResponse.json({
        success: true,
        message: "เชื่อมต่อหมายเลขสมาชิกสำเร็จ",
        memberCode: memberCode,
        memberData: {
          MEMBER_CODE: memberData.MEMBER_CODE,
          REGIST_CODE: memberData.REGIST_CODE,
          COMP_PERSON_CODE: memberData.COMP_PERSON_CODE,
          COMPANY_NAME: memberData.COMPANY_NAME,
        },
      });
    } catch (error) {
      await mysqlConnection.rollback();
      throw error;
    } finally {
      if (mysqlConnection) {
        mysqlConnection.release();
      }
    }
  } catch (error) {
    console.error("Error connecting member code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
