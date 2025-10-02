import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if environment variables are loaded
    const envVars = {
      DB_HOST: process.env.DB_HOST || "not set",
      DB_USER: process.env.DB_USER || "not set",
      DB_NAME: process.env.DB_NAME || "not set",
      DB_PORT: process.env.DB_PORT || "not set",
      hasPassword: !!process.env.DB_PASSWORD,
    };

    console.log("Environment variables:", envVars);

    return NextResponse.json({
      success: true,
      envVars: envVars,
    });
  } catch (error) {
    console.error("Error checking environment variables:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
