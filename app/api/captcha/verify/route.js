import { NextResponse } from "next/server";

// Google reCAPTCHA server-side verification
// Docs: https://developers.google.com/recaptcha/docs/verify

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let token = "";
    let remoteip = "";
    let expectedAction = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      token = (body?.token || body?.recaptchaToken || "").toString();
      remoteip = (body?.remoteip || "").toString();
      expectedAction = (body?.action || body?.expectedAction || "").toString();
    } else {
      const form = await req.formData();
      token = (form.get("token") || form.get("recaptchaToken") || "").toString();
      remoteip = (form.get("remoteip") || "").toString();
      expectedAction = (form.get("action") || form.get("expectedAction") || "").toString();
    }

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing reCAPTCHA token" }, { status: 400 });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "Server is not configured with RECAPTCHA_SECRET_KEY" },
        { status: 500 },
      );
    }

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteip) params.append("remoteip", remoteip);

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await verifyRes.json();

    // data.success: boolean
    // data.score (v3), data.action (v3), data.hostname, data.challenge_ts
    if (!data.success) {
      return NextResponse.json(
        { ok: false, reason: "verify_failed", result: data },
        { status: 400 },
      );
    }

    // Check if this is reCAPTCHA v3 (has score) or v2 (no score)
    const isV3 = typeof data.score === "number";

    if (isV3) {
      // reCAPTCHA v3 validations
      const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");
      const configuredExpectedAction = (
        process.env.RECAPTCHA_EXPECTED_ACTION || "register"
      ).toString();
      const allowedHostnamesEnv = (
        process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "ftimemberportal-529sy.kinsta.app,localhost"
      ).toString();
      const allowedHostnames = allowedHostnamesEnv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // Validate score
      if (data.score < minScore) {
        return NextResponse.json(
          { ok: false, reason: "low_score", minScore, score: data.score, result: data },
          { status: 400 },
        );
      }

      // Validate action (if provided by client and/or env expects)
      const actionToCheck = expectedAction || configuredExpectedAction;
      if (data.action && actionToCheck && data.action !== actionToCheck) {
        return NextResponse.json(
          {
            ok: false,
            reason: "action_mismatch",
            expected: actionToCheck,
            actual: data.action,
            result: data,
          },
          { status: 400 },
        );
      }

      // Validate hostname (if present)
      if (data.hostname) {
        const hostOk = allowedHostnames.includes(String(data.hostname).toLowerCase());
        if (!hostOk) {
          return NextResponse.json(
            {
              ok: false,
              reason: "hostname_not_allowed",
              hostname: data.hostname,
              allowedHostnames,
            },
            { status: 400 },
          );
        }
      }
    } else {
      // For reCAPTCHA v2, we only check if success is true
      // No additional validations needed as the checkbox itself is the verification
      console.log("reCAPTCHA v2 verification successful");
    }

    return NextResponse.json({ ok: true, result: data });
  } catch (err) {
    console.error("/api/captcha/verify error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
