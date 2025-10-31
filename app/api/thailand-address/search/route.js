// app/api/thailand-address/search/route.js
import { NextResponse } from "next/server";
import rateLimiter from "../../../lib/rate-limiter";

// Import the data fetching function directly
let cachedData = null;
let lastFetch = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchThailandData() {
  // If we have cache and it's not expired
  if (cachedData && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
    return cachedData;
  }

  try {
    console.log("Fetching Thailand address data from server...");

    // Fetch data from GitHub (server-side won't be affected by CORS)
    const response = await fetch(
      "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Thailand-Address-API/1.0)",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    const processedData = processThailandData(rawData);

    cachedData = processedData;
    lastFetch = Date.now();
    console.log(`Successfully loaded ${processedData.length} records`);

    return cachedData;
  } catch (error) {
    console.error("Error fetching Thailand data:", error);
    throw error;
  }
}

function processThailandData(rawData) {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData
    .map((item) => ({
      subdistrict: (item.district || item.tambon || "").trim(),
      district: (item.amphoe || item.amphur || "").trim(),
      province: (item.province || item.changwat || "").trim(),
      postalCode: (item.zipcode || item.postal_code || "").toString().trim(),
    }))
    .filter((item) => item.subdistrict && item.district && item.province && item.postalCode);
}

export async function GET(request) {
  try {
    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Rate limiting: 300 requests per minute per IP (more reasonable for UI search)
    const rateCheck = rateLimiter.checkRateLimit(ip, 60000, 300);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "คำขอมากเกินไป กรุณาลองใหม่ในอีกสักครู่",
          retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "Retry-After": Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "subdistrict";

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร",
      });
    }

    // Check cache first
    const cacheKey = `address_${type}_${query.toLowerCase()}`;
    const cached = rateLimiter.getCached(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // ดึงข้อมูลโดยตรงจากฟังก์ชัน fetchThailandData แทนการเรียก API
    const allData = await fetchThailandData();

    // กรองข้อมูลตามประเภทและคำค้นหา
    let filteredData = [];
    const searchTerm = query.toLowerCase().trim();

    if (type === "subdistrict") {
      filteredData = allData
        .filter((item) => item.subdistrict.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.subdistrict.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.subdistrict.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.subdistrict.localeCompare(b.subdistrict, "th");
        })
        .slice(0, 10);
    } else if (type === "district") {
      filteredData = allData
        .filter((item) => item.district.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.district.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.district.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.district.localeCompare(b.district, "th");
        })
        .slice(0, 10);
    } else if (type === "province") {
      filteredData = allData
        .filter((item) => item.province.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.province.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.province.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.province.localeCompare(b.province, "th");
        })
        .slice(0, 100);
    } else if (type === "postalCode") {
      filteredData = allData
        .filter((item) => item.postalCode.includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.postalCode.startsWith(searchTerm);
          const bStartsWith = b.postalCode.startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.postalCode.localeCompare(b.postalCode);
        })
        .slice(0, 100);
    }

    // Deduplicate per type to avoid duplicate dropdown entries
    const seen = new Set();
    const deduped = filteredData
      .filter((item) => {
        let key = "";
        if (type === "subdistrict") {
          key =
            `${item.subdistrict}|${item.district}|${item.province}|${item.postalCode}`.toLowerCase();
        } else if (type === "district") {
          key = `${item.district}|${item.province}`.toLowerCase();
        } else if (type === "province") {
          key = item.province.toLowerCase();
        } else if (type === "postalCode") {
          key =
            `${item.postalCode}|${item.subdistrict}|${item.district}|${item.province}`.toLowerCase();
        }

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ SearchableDropdown ต้องการ
    const formattedData = deduped.map((item) => {
      if (type === "subdistrict") {
        return {
          id: item.subdistrict,
          text: item.subdistrict,
          subText: `${item.district}, ${item.province} ${item.postalCode}`,
          district: item.district,
          province: item.province,
          postalCode: item.postalCode,
        };
      } else if (type === "district") {
        return {
          id: item.district,
          text: item.district,
          subText: `${item.province}`,
          province: item.province,
        };
      } else if (type === "province") {
        return {
          id: item.province,
          text: item.province,
        };
      } else if (type === "postalCode") {
        return {
          id: item.postalCode,
          text: `${item.subdistrict} (${item.postalCode})`,
          subText: `${item.district}, ${item.province}`,
          subdistrict: item.subdistrict,
          district: item.district,
          province: item.province,
          postalCode: item.postalCode,
        };
      }
    });

    // Cache the result (5 minutes)
    rateLimiter.setCache(cacheKey, formattedData, 300000);

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error searching address data:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการค้นหาข้อมูล: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
