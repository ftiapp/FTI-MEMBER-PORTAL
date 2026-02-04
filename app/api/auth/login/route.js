export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

// Ensure Buffer exists (avoid polyfill issues during build/edge contexts)
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

async function getJwt() {
  const mod = await import("jsonwebtoken");
  return mod.default || mod;
}

// Progressive rate limiter with increasing lockout times (only increments on failed attempts)
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

  // Get current status without incrementing counters
  getStatus(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || {
      count: 0,
      resetAt: 0,
      lockoutCount: 0,
      isLocked: false,
      captchaRequired: false,
    };

    if (userAttempts.isLocked && now > userAttempts.resetAt) {
      // Lockout expired
      userAttempts.count = 0;
      userAttempts.isLocked = false;
      // Keep captchaRequired true after a lockout only if there were multiple failures
      // but allow it to be cleared on successful login via reset()
    }

    // Persist any changes
    this.attempts.set(key, userAttempts);

    return {
      limited: userAttempts.isLocked,
      remaining: userAttempts.isLocked ? 0 : Math.max(0, this.maxAttempts - userAttempts.count),
      resetAt: userAttempts.resetAt,
      lockoutCount: userAttempts.lockoutCount,
      captchaRequired: userAttempts.captchaRequired,
    };
  },

  // Record a failed attempt
  fail(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || {
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
        userAttempts.count = 0;
      }
    }
    this.attempts.set(key, userAttempts);
    return this.getStatus(key);
  },

  // On successful login, fully reset attempts and CAPTCHA requirement
  reset(key) {
    const userAttempts = this.attempts.get(key);
    if (userAttempts) {
      userAttempts.count = 0;
      userAttempts.isLocked = false;
      userAttempts.captchaRequired = false;
      this.attempts.set(key, userAttempts);
    }
  },
};

// Mock FTI_Portal_User สำหรับการทดสอบ
const mockUsers = [
  {
    id: 1,
    name: "ทดสอบ ระบบ",
    email: "test@example.com",
    phone: "0812345678",
    password: "$2a$10$zH9/qHpGQQBGSuQbVuVQy.lGGmMiXk7mKfTbAO8XmKfBrEcIIUgRu", // รหัสผ่าน: password123
    role: "member",
    status: "active",
    created_at: "2025-01-01 00:00:00",
    updated_at: "2025-01-01 00:00:00",
  },
  {
    id: 2,
    name: "Pairoj Chuanchanachai",
    email: "c.pairoj.n@gmail.com",
    phone: "0812345678",
    password: "$2a$10$zH9/qHpGQQBGSuQbVuVQy.lGGmMiXk7mKfTbAO8XmKfBrEcIIUgRu", // รหัสผ่าน: password123
    role: "admin",
    status: "active",
    created_at: "2025-01-01 00:00:00",
    updated_at: "2025-01-01 00:00:00",
  },
];

export async function POST(request) {
  try {
    // Get request body first (so we can build a more specific rate limit key)
    const body = await request.json();

    // Get client IP address from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown-ip";

    // Build a tighter rate-limit key: IP + email to avoid global IP-wide CAPTCHA
    const emailForKey = (body?.email || "unknown-email").toLowerCase();
    const rlKey = `${ip}:${emailForKey}`;

    // Check rate limit status (no increment)
    const rateLimitResult = rateLimit.getStatus(rlKey);

    if (rateLimitResult.limited) {
      // Calculate time remaining in minutes and seconds
      const timeRemaining = Math.max(0, rateLimitResult.resetAt - Date.now());
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);

      // Return 429 Too Many Requests with retry information
      return new NextResponse(
        JSON.stringify({
          error: "รหัสผ่านไม่ถูกต้องหลายครั้ง กรุณาลองใหม่ภายหลัง",
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
            "X-RateLimit-Reset": Math.ceil(rateLimitResult.resetAt / 1000).toString(),
          },
        },
      );
    }

    // Check if CAPTCHA is required but not provided
    if (
      rateLimitResult.captchaRequired &&
      (!body.captchaToken || body.captchaToken.trim() === "")
    ) {
      return new NextResponse(
        JSON.stringify({
          error: "กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ",
          captchaRequired: true,
          remaining: rateLimitResult.remaining,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimit.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          },
        },
      );
    }

    // If CAPTCHA is required, verify the token (placeholder for actual verification)
    // In a real implementation, you would verify the token with Google reCAPTCHA or hCaptcha API
    if (rateLimitResult.captchaRequired && body.captchaToken) {
      // TODO: Implement actual CAPTCHA verification
      // const captchaValid = await verifyCaptcha(body.captchaToken);
      // if (!captchaValid) {
      //   return new NextResponse(
      //     JSON.stringify({
      //       error: 'การยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      //       captchaRequired: true
      //     }),
      //     { status: 400, headers: { 'Content-Type': 'application/json' } }
      //   );
      // }
    }

    const { email, password, rememberMe } = body;

    // Log the rememberMe parameter
    console.log("Login attempt:", {
      email: email,
      rememberMe: !!rememberMe,
      usingMockData: false,
    });

    // Log removed as it's now above

    // Find user in database
    const FTI_Portal_User = await query("SELECT * FROM FTI_Portal_User WHERE email = ?", [email]);

    if (FTI_Portal_User.length === 0) {
      console.log("User not found:", email);
      // Record failed attempt
      rateLimit.fail(rlKey);
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const user = FTI_Portal_User[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log("Password verification:", {
      isValid: isValidPassword,
      userId: user.id,
    });

    if (!isValidPassword) {
      // Record failed attempt
      rateLimit.fail(rlKey);
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // Check if email is verified
    if (!user.email_verified) {
      // Do not count this as a failed password attempt
      return NextResponse.json(
        {
          error: "กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ",
          requiresVerification: true,
        },
        { status: 403 },
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // สร้าง JWT token with expiration based on rememberMe
    const expiresIn = rememberMe ? "30d" : "1d"; // 30 days if remember me, 1 day if not

    const jwt = await getJwt();

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        rememberMe: !!rememberMe,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn },
    );

    // Generate session ID
    const sessionId = `${Date.now()}_${user.id}`;

    // Reset rate limit after successful login
    rateLimit.reset(rlKey);

    // สร้าง response object
    const response = NextResponse.json({
      user: userWithoutPassword,
      sessionId,
    });

    // เก็บ token ใน cookie with expiration matching JWT expiry to avoid mismatch
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;

    // Get the hostname from request headers to set domain correctly
    const host = request.headers.get("host") || "";
    const domain = host.includes("localhost") ? undefined : host.split(":")[0];

    // Calculate explicit expiry date
    const expiryDate = new Date(Date.now() + maxAge * 1000);

    // Store credentials in HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from 'strict' to 'lax' for better compatibility
      maxAge,
      path: "/",
      domain,
      expires: expiryDate, // Add explicit expiry date
    });

    // Also store a flag indicating remember me preference in a regular cookie
    // This is not sensitive data, so it doesn't need to be httpOnly
    response.cookies.set({
      name: "rememberMe",
      value: rememberMe ? "1" : "0",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
      domain,
      expires: expiryDate, // Add explicit expiry date
    });

    // Store email in a non-httpOnly cookie for auto-fill functionality
    // Always set userEmail cookie regardless of rememberMe and align expiry with token
    response.cookies.set({
      name: "userEmail",
      value: email,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
      domain,
      expires: expiryDate, // Add explicit expiry date
    });

    return response;
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}
