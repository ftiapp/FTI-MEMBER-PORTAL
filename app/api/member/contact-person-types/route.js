import { NextResponse } from "next/server";
import { executeQueryWithoutTransaction } from "@/app/lib/db";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
let contactPersonTypesCache = { data: null, expiresAt: 0 };

export async function GET() {
  try {
    if (isProd && contactPersonTypesCache.data && contactPersonTypesCache.expiresAt > Date.now()) {
      return NextResponse.json(contactPersonTypesCache.data, { status: 200 });
    }

    const rows = await executeQueryWithoutTransaction(
      `SELECT id, type_code, type_name_th, type_name_en
       FROM MemberRegist_ContactPerson_TYPE
       WHERE is_active = 1
       ORDER BY id ASC`,
      [],
    );

    const responseBody = { success: true, data: rows || [] };

    if (isProd) {
      contactPersonTypesCache = {
        data: responseBody,
        expiresAt: Date.now() + TWENTY_FOUR_HOURS_MS,
      };
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("[API] contact-person-types GET error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงประเภทผู้ติดต่อได้" },
      { status: 500 },
    );
  }
}
