export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Deprecated: legacy rejections list endpoint no longer used. Return 410 Gone to avoid build/runtime issues.
export async function GET() {
  return NextResponse.json(
    { success: false, message: "This endpoint is deprecated and unavailable." },
    { status: 410 },
  );
}
