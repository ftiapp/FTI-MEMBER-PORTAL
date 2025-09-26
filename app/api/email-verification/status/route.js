import { NextResponse } from "next/server";
import { getVerificationStatus } from "@/app/lib/mailersend-verification";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });
    }

    const data = await getVerificationStatus(jobId);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("/api/email-verification/status error", err);
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
