import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

// Helper function to normalize database results
function normalizeDbResult(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result[0])) return result[0];
  return [result];
}

// Helper function to get single record
function getSingleRecord(result) {
  const normalized = normalizeDbResult(result);
  return normalized.length > 0 ? normalized[0] : null;
}

export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = await params;

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    console.log("🔍 Fetching rejected application - ID:", id, "User:", userId);

    // Fetch from MemberRegist_Rejections table (new system)
    const [rejectData] = await connection.execute(
      `SELECT id, membership_type, membership_id, history_snapshot_id, status, resubmission_count, rejected_at
       FROM MemberRegist_Rejections 
       WHERE (id = ? OR membership_id = ?) AND user_id = ?
       ORDER BY rejected_at DESC
       LIMIT 1`,
      [id, id, userId],
    );

    if (!rejectData.length) {
      console.log("❌ No rejected application found");
      return NextResponse.json(
        {
          success: false,
          message: "Rejected application not found or access denied",
        },
        { status: 404 },
      );
    }

    const reject = rejectData[0];
    const { membership_type, membership_id, history_snapshot_id } = reject;
    const rejectId = reject.id;

    console.log("✅ Found reject record:", rejectId, membership_type, membership_id);

    // Fetch data from History tables based on membership_type
    let rejectionData = null;

    switch (membership_type) {
      case "oc":
        // Check OC History table
        const [ocApp] = await connection.execute(
          `SELECT * FROM MemberRegist_Reject_OC_Main_History WHERE history_id = ?`,
          [history_snapshot_id],
        );

        if (ocApp.length > 0) {
          console.log("✅ Found OC rejected application");
          const app = ocApp[0];

          try {
            // Fetch all related data from History tables in parallel
            const [
              representatives,
              products,
              businessTypes,
              businessTypeOther,
              industryGroups,
              provinceChapters,
              addresses,
              contactPersons,
              documents,
              signatureNames,
              convCount,
            ] = await Promise.all([
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_Representatives_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_Products_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_BusinessTypes_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_BusinessTypeOther_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_IndustryGroups_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_ProvinceChapters_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_Address_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_ContactPerson_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_Documents_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_OC_Signature_Name_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT COUNT(*) as count FROM MemberRegist_Rejection_Conversations WHERE rejection_id = ?`,
                [rejectId],
              ),
            ]);

            console.log("📊 Fetched OC related data:", {
              representatives: representatives[0].length,
              products: products[0].length,
              businessTypes: businessTypes[0].length,
              industryGroups: industryGroups[0].length,
              provinceChapters: provinceChapters[0].length,
              addresses: addresses[0].length,
              contactPersons: contactPersons[0].length,
              documents: documents[0].length,
              signatureNames: signatureNames[0].length,
            });

            return NextResponse.json({
              success: true,
              data: {
                rejectId,
                membershipType: "oc",
                membershipId: app.original_id || app.id,
                applicationName: app.company_name_th,
                status: reject.status, // Use rejection status, not app status
                resubmissionCount: reject.resubmission_count || 0,
                rejectedAt: reject.rejected_at,
                conversationCount: convCount[0][0].count,
                rejectionData: {
                  main: app,
                  representatives: representatives[0] || [],
                  products: products[0] || [],
                  businessTypes: businessTypes[0] || [],
                  businessTypeOther:
                    businessTypeOther[0].length > 0 ? businessTypeOther[0][0] : null,
                  industryGroups: industryGroups[0] || [],
                  provinceChapters: provinceChapters[0] || [],
                  addresses: addresses[0] || [],
                  contactPersons: contactPersons[0] || [],
                  documents: documents[0] || [],
                  signatureName: signatureNames[0].length > 0 ? signatureNames[0][0] : null,
                },
              },
            });
          } catch (error) {
            console.error("❌ Error fetching OC data:", error);
            throw error;
          }
        }
        break;

      case "ic":
        // Check IC History table
        const [icApp] = await connection.execute(
          `SELECT * FROM MemberRegist_Reject_IC_Main_History WHERE history_id = ?`,
          [history_snapshot_id],
        );

        if (icApp.length > 0) {
          console.log("✅ Found IC rejected application");
          const app = icApp[0];

          try {
            // Fetch all related data from History tables in parallel
            const [
              representatives,
              products,
              businessTypes,
              businessTypeOther,
              icAddresses,
              documents,
              signatureNames,
              convCount,
            ] = await Promise.all([
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_Representatives_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_Products_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_BusinessTypes_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_BusinessTypeOther_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_Address_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_Documents_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT * FROM MemberRegist_Reject_IC_SignatureName_History WHERE main_history_id = ?`,
                [history_snapshot_id],
              ),
              connection.execute(
                `SELECT COUNT(*) as count FROM MemberRegist_Rejection_Conversations WHERE rejection_id = ?`,
                [rejectId],
              ),
            ]);

            return NextResponse.json({
              success: true,
              data: {
                rejectId,
                membershipType: "ic",
                membershipId: app.original_id || app.id,
                applicationName: `${app.first_name_th} ${app.last_name_th}`,
                status: reject.status, // Use rejection status, not app status
                resubmissionCount: reject.resubmission_count || 0,
                rejectedAt: reject.rejected_at,
                conversationCount: convCount[0].count,
                rejectionData: {
                  main: app,
                  representatives: representatives[0] || [],
                  products: products[0] || [],
                  businessTypes: businessTypes[0] || [],
                  businessTypeOther:
                    businessTypeOther[0].length > 0 ? businessTypeOther[0][0] : null,
                  addresses: icAddresses[0] || [],
                  documents: documents[0] || [],
                  signatureName: signatureNames[0].length > 0 ? signatureNames[0][0] : null,
                },
              },
            });
          } catch (error) {
            console.error("❌ Error fetching IC data:", error);
            throw error;
          }
        }
        break;

      case "ac":
        // Check AC History table
        const [acApp] = await connection.execute(
          `SELECT * FROM MemberRegist_Reject_AC_Main_History WHERE history_id = ?`,
          [history_snapshot_id],
        );

        if (acApp.length > 0) {
          console.log("✅ Found AC rejected application");
          const app = acApp[0];

          const [representatives] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_Representatives_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [products] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_Products_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [businessTypes] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_BusinessTypes_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [businessTypeOther] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_BusinessTypeOther_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [industryGroups] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_IndustryGroups_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [acAddresses] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_Address_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [acContactPersons] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AC_ContactPerson_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          // Get conversation count
          const [convCount] = await connection.execute(
            `SELECT COUNT(*) as count FROM MemberRegist_Rejection_Conversations WHERE rejection_id = ?`,
            [rejectId],
          );

          return NextResponse.json({
            success: true,
            data: {
              rejectId,
              membershipType: "ac",
              membershipId: app.original_id || app.id,
              applicationName: app.company_name_th,
              status: reject.status, // Use rejection status, not app status
              resubmissionCount: reject.resubmission_count || 0,
              rejectedAt: reject.rejected_at,
              conversationCount: convCount[0].count,
              rejectionData: {
                main: app,
                representatives: representatives || [],
                products: products || [],
                businessTypes: businessTypes || [],
                businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0] : null,
                industryGroups: industryGroups || [],
                provinceChapters: provinceChapters || [],
                addresses: acAddresses || [],
                contactPersons: acContactPersons || [],
              },
            },
          });
        }
        break;

      case "am":
        // Check AM History table
        const [amApp] = await connection.execute(
          `SELECT * FROM MemberRegist_Reject_AM_Main_History WHERE history_id = ?`,
          [history_snapshot_id],
        );

        if (amApp.length > 0) {
          console.log("✅ Found AM rejected application");
          const app = amApp[0];

          const [representatives] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_Representatives_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [products] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_Products_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [businessTypes] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_BusinessTypes_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [businessTypeOther] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_BusinessTypeOther_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [amAddresses] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_Address_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          const [amContactPersons] = await connection.execute(
            `SELECT * FROM MemberRegist_Reject_AM_ContactPerson_History WHERE main_history_id = ?`,
            [history_snapshot_id],
          );

          // Get conversation count
          const [convCount] = await connection.execute(
            `SELECT COUNT(*) as count FROM MemberRegist_Rejection_Conversations WHERE rejection_id = ?`,
            [rejectId],
          );

          return NextResponse.json({
            success: true,
            data: {
              rejectId,
              membershipType: "am",
              membershipId: app.original_id || app.id,
              applicationName: app.company_name_th,
              status: reject.status, // Use rejection status, not app status
              resubmissionCount: reject.resubmission_count || 0,
              rejectedAt: reject.rejected_at,
              conversationCount: convCount[0].count,
              rejectionData: {
                main: app,
                representatives: representatives || [],
                products: products || [],
                businessTypes: businessTypes || [],
                businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0] : null,
                addresses: amAddresses || [],
                contactPersons: amContactPersons || [],
              },
            },
          });
        }
        break;

      default:
        console.error(`❌ Unknown membership type: ${membership_type}`);
        return NextResponse.json(
          {
            success: false,
            message: "Unknown membership type",
          },
          { status: 400 },
        );
    }

    // If no data found in the correct history table
    console.log(`❌ No ${membership_type.toUpperCase()} data found in history table`);
    return NextResponse.json(
      {
        success: false,
        message: `${membership_type.toUpperCase()} rejected application not found in history`,
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("💥 Error fetching rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rejected application",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}

// DELETE endpoint to cancel/remove a rejected application
export async function DELETE(request, { params }) {
  let connection;

  try {
    const { id } = await params;

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    console.log("🗑️ Cancelling rejected application - ID:", id, "User:", userId);

    // Try to find and cancel in each Main table where status = 2 (rejected)
    const tableMap = {
      oc: "MemberRegist_OC_Main",
      am: "MemberRegist_AM_Main",
      ac: "MemberRegist_AC_Main",
      ic: "MemberRegist_IC_Main",
    };

    let cancelled = false;

    for (const [type, table] of Object.entries(tableMap)) {
      const [result] = await connection.execute(
        `UPDATE ${table} SET status = 3, updated_at = NOW() WHERE id = ? AND user_id = ? AND status = 2`,
        [id, userId],
      );

      if (result.affectedRows > 0) {
        console.log(`✅ Cancelled ${type.toUpperCase()} application`);
        cancelled = true;
        break;
      }
    }

    if (!cancelled) {
      console.log("❌ No rejected application found to cancel");
      return NextResponse.json(
        {
          success: false,
          message: "Rejected application not found or access denied",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application cancelled successfully",
    });
  } catch (error) {
    console.error("💥 Error cancelling rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel application",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
