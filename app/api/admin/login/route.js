import { NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession, logAdminAction } from "@/app/lib/adminAuth";

// Progressive rate limiter with increasing lockout times (following security best practices)
const rateLimit = {
  attempts: new Map(),
  maxAttempts: 4, // 4 failed attempts before lockout
  captchaThreshold: 3, // Require CAPTCHA after 3 failed attempts
  lockoutLevels: [
    5 * 60 * 1000, // 5 minutes for first lockout
    10 * 60 * 1000, // 10 minutes for second lockout
    30 * 60 * 1000, // 30 minutes for third lockout
    60 * 60 * 1000, // 1 hour for fourth and subsequent lockouts
  ],

  // Get current state without mutating counts (used before verifying credentials)
  inspect(ip) {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip) || {
      count: 0,
      resetAt: 0,
      lockoutCount: 0,
      isLocked: false,
      captchaRequired: false,
    };

    // If lockout expired, clear lock but keep captchaRequired state
    if (userAttempts.isLocked && now > userAttempts.resetAt) {
      userAttempts.isLocked = false;
      userAttempts.count = 0;
      this.attempts.set(ip, userAttempts);
    }

    return {
      limited: userAttempts.isLocked,
      remaining: userAttempts.isLocked ? 0 : Math.max(0, this.maxAttempts - userAttempts.count),
      resetAt: userAttempts.resetAt,
      lockoutCount: userAttempts.lockoutCount,
      captchaRequired: userAttempts.captchaRequired,
    };
  },

  // Record a failed attempt and update state
  recordFailure(ip) {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip) || {
      count: 0,
      resetAt: 0,
      lockoutCount: 0,
      isLocked: false,
      captchaRequired: false,
    };

    if (!userAttempts.isLocked) {
      userAttempts.count += 1;

      if (userAttempts.count >= this.captchaThreshold) {
        userAttempts.captchaRequired = true;
      }

      if (userAttempts.count > this.maxAttempts) {
        userAttempts.isLocked = true;
        const lockoutLevel = Math.min(userAttempts.lockoutCount, this.lockoutLevels.length - 1);
        const lockoutDuration = this.lockoutLevels[lockoutLevel];
        userAttempts.resetAt = now + lockoutDuration;
        userAttempts.lockoutCount += 1;
        userAttempts.count = 0; // reset window after lockout starts
      }
    }

    this.attempts.set(ip, userAttempts);
    return this.inspect(ip);
  },

  reset(ip) {
    const userAttempts = this.attempts.get(ip);
    if (userAttempts) {
      userAttempts.count = 0;
      userAttempts.isLocked = false;
      // Keep captchaRequired as-is; success path will naturally pass without CAPTCHA next time
      this.attempts.set(ip, userAttempts);
    }
  },
};

export async function POST(request) {
  try {
    // Get client IP address from request headers (try multiple headers, fallback distinct per session if possible)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "unknown-ip";

    // Inspect rate limit WITHOUT incrementing (avoid penalizing before verification)
    const rateLimitState = rateLimit.inspect(ip);

    // Get request body
    const body = await request.json();
    const { username, password, captchaToken } = body;

    // If currently locked, block immediately
    if (rateLimitState.limited) {
      // Calculate time remaining in minutes and seconds
      const timeRemaining = Math.max(0, rateLimitState.resetAt - Date.now());
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);

      // Return 429 Too Many Requests with retry information
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "รหัสผ่านไม่ถูกต้องหลายครั้ง กรุณาลองใหม่ภายหลัง",
          retryAfter: Math.ceil(timeRemaining / 1000),
          timeRemaining: { minutes, seconds },
          captchaRequired: true,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(timeRemaining / 1000).toString(),
            "X-RateLimit-Limit": rateLimit.maxAttempts.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimitState.resetAt / 1000).toString(),
          },
        },
      );
    }

    // If CAPTCHA is required (due to previous failures) but not provided
    if (rateLimitState.captchaRequired && (!captchaToken || captchaToken.trim() === "")) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ",
          captchaRequired: true,
          remaining: rateLimitState.remaining,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimit.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitState.remaining.toString(),
          },
        },
      );
    }

    // If CAPTCHA is required, verify the token (placeholder for actual verification)
    // In a real implementation, you would verify the token with Google reCAPTCHA or hCaptcha API
    if (rateLimitState.captchaRequired && captchaToken) {
      // TODO: Implement actual CAPTCHA verification
      // const captchaValid = await verifyCaptcha(captchaToken);
      // if (!captchaValid) {
      //   return new NextResponse(
      //     JSON.stringify({
      //       success: false,
      //       message: 'การยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      //       captchaRequired: true
      //     }),
      //     { status: 400, headers: { 'Content-Type': 'application/json' } }
      //   );
      // }
    }

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 },
      );
    }

    // Verify admin credentials
    const result = await verifyAdminPassword(username, password);

    if (!result.success) {
      // Record failed attempt AFTER verifying credentials
      rateLimit.recordFailure(ip);
      // Log failed login attempt
      console.log(`Failed admin login attempt for username: ${username}`);

      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }

    // Create session
    await createAdminSession(result.admin);

    // Log admin login
    await logAdminAction(result.admin.id, "login", null, "Admin login successful", request);

    // Reset rate limit after successful login
    rateLimit.reset(ip);

    return NextResponse.json({
      success: true,
      adminLevel: result.admin.adminLevel,
      username: result.admin.username,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 },
    );
  }
}
