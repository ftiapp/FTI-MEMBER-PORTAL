import { NextResponse } from "next/server";
import { startEmailVerification, waitForVerification } from "@/app/lib/mailersend-verification.postmark";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email;
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body?.email?.trim();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      email = (form.get("email") || "").toString().trim();
    } else {
      const body = await req.json().catch(() => ({}));
      email = body?.email?.trim();
    }

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    // Kick off verification
    const { job_id } = await startEmailVerification(email);

    // Short-poll to try to return a real-time result (optional)
    const poll = await waitForVerification(job_id, { timeoutMs: 7000, intervalMs: 700 });

    return NextResponse.json({ ok: true, jobId: job_id, poll });
  } catch (err) {
    console.error("/api/email-verification/verify error", err);
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
