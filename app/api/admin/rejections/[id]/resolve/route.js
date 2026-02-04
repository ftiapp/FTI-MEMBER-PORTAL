export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Deprecated: underlying rejections table/workflow not used. Return 410 to avoid build/runtime errors.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "This endpoint is deprecated and unavailable.",
    },
    { status: 410 },
  );
}
