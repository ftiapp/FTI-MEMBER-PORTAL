import { NextResponse } from "next/server";

/**
 * GET /api/dbd/company/[taxId]
 * Proxy endpoint for DBD API with error handling for rate limiting and network issues
 */
export async function GET(request, { params }) {
  try {
    const { taxId } = await params;

    if (!taxId || taxId.length !== 13) {
      return NextResponse.json(
        {
          success: false,
          message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง กรุณากรอก 13 หลัก",
        },
        { status: 400 },
      );
    }

    // เรียก DBD API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`https://openapi.dbd.go.th/api/v1/juristic_person/${taxId}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      // จัดการ rate limiting (429) และ service unavailable (503)
      if (response.status === 429 || response.status === 503) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
            errorType: "rate_limit",
          },
          { status: 503 },
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ไม่พบเลขประจำตัวผู้เสียภาษีนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง หากท่านยืนยันว่าถูกต้อง ให้กรอกข้อมูลด้วยตนเอง",
            errorType: "not_found",
          },
          { status: 404 },
        );
      }

      const data = await response.json();

      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (data && data.status?.code === "1000" && data.data && data.data.length > 0) {
        const companyData = data.data[0]["cd:OrganizationJuristicPerson"];
        const address = companyData["cd:OrganizationJuristicAddress"]?.["cr:AddressType"];

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
        const formattedData = {
          companyName: companyData["cd:OrganizationJuristicNameTH"] || "",
          companyNameEn: companyData["cd:OrganizationJuristicNameEN"] || "",
          address: {
            addressNumber: address?.["cd:AddressNo"] || "",
            building: address?.["cd:Building"] || address?.["cd:Village"] || "",
            street: address?.["cd:Road"] || "",
            subDistrict: address?.["cd:CitySubDivision"]?.["cr:CitySubDivisionTextTH"] || "",
            district: address?.["cd:City"]?.["cr:CityTextTH"] || "",
            province: address?.["cd:CountrySubDivision"]?.["cr:CountrySubDivisionTextTH"] || "",
          },
        };

        return NextResponse.json({
          success: true,
          data: formattedData,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              "ไม่พบเลขประจำตัวผู้เสียภาษีนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง หากท่านยืนยันว่าถูกต้อง ให้กรอกข้อมูลด้วยตนเอง",
            errorType: "not_found",
          },
          { status: 404 },
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Timeout error
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            message:
              "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
            errorType: "timeout",
          },
          { status: 504 },
        );
      }

      // Network error
      throw fetchError;
    }
  } catch (error) {
    console.error("DBD API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "ขณะนี้ระบบดึงข้อมูลอัตโนมัติไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง หรือใช้โหมดกรอกข้อมูลด้วยตนเอง ขออภัยในความไม่สะดวก",
        errorType: "network_error",
      },
      { status: 500 },
    );
  }
}
