export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Deprecated: legacy rejected applications endpoint no longer in use.
// Return 410 Gone to avoid build/runtime issues and DB access.
export async function GET() {
  return NextResponse.json(
    { success: false, message: "This endpoint is deprecated and unavailable." },
    { status: 410 },
  );
}
