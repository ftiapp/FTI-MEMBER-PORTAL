import { NextResponse } from "next/server";
import { PDF_CONFIG } from "@/app/membership/utils/pdfutils/pdf-config.js";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      application,
      type,
      industrialGroups = {},
      provincialChapters = {},
      options = {},
    } = body || {};

    if (!application || !type) {
      return NextResponse.json(
        { error: "Missing required fields: application, type" },
        { status: 400 },
      );
    }

    const { generateMembershipPDF } = await import(
      "../../../membership/utils/pdfutils/pdf-generator.js"
    );

    // Build absolute logo URL if provided as relative in config
    const { origin } = new URL(request.url);
    const baseUrl = origin;
    const logoPath =
      options.logoPath ||
      (PDF_CONFIG?.FTI_LOGO_PATH && PDF_CONFIG.FTI_LOGO_PATH.startsWith("/")
        ? `${origin}${PDF_CONFIG.FTI_LOGO_PATH}`
        : PDF_CONFIG?.FTI_LOGO_PATH);

    const result = await generateMembershipPDF(
      application,
      type,
      industrialGroups,
      provincialChapters,
      {
        ...options,
        logoPath,
        baseUrl,
      },
    );

    if (!result?.success || !result?.buffer) {
      return NextResponse.json(
        { error: result?.error || "Failed to generate PDF" },
        { status: 500 },
      );
    }

    const isDev = process.env.NODE_ENV === "development";

    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.filename || "membership.pdf")}"`,
        "Cache-Control": isDev
          ? "no-store, no-cache, must-revalidate, proxy-revalidate"
          : "no-store, must-revalidate",
        ...(isDev && {
          Pragma: "no-cache",
          Expires: "0",
        }),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
