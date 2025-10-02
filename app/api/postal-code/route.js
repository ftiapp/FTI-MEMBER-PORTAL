// app/api/postal-code/route.js
import { NextResponse } from "next/server";
import rateLimiter from "../../lib/rate-limiter";

// Import the thailand address data fetching function directly
let cachedData = null;
let lastFetch = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

async function fetchThailandData() {
  // ถ้ามี cache และยังไม่หมดอายุ
  if (cachedData && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
    return cachedData;
  }

  // รายการ Proxy URLs สำหรับ fallback
  const proxyUrls = [
    // ลองเข้าถึงโดยตรงก่อน
    "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
    // CORS Proxy services
    "https://cors-anywhere.herokuapp.com/https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
    "https://api.allorigins.win/get?url=" +
      encodeURIComponent(
        "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
      ),
    "https://corsproxy.io/?" +
      encodeURIComponent(
        "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
      ),
  ];

  let lastError = null;

  for (let i = 0; i < proxyUrls.length; i++) {
    try {
      console.log(
        `Attempt ${i + 1}: Fetching Thailand address data from ${proxyUrls[i].includes("allorigins") ? "AllOrigins proxy" : proxyUrls[i].includes("cors-anywhere") ? "CORS Anywhere proxy" : proxyUrls[i].includes("corsproxy") ? "CorsProxy.io" : "GitHub direct"}...`,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per attempt

      const response = await fetch(proxyUrls[i], {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Thailand-Address-API/1.0)",
          Accept: "application/json",
          "Cache-Control": "no-cache",
          // เพิ่ม header สำหรับ CORS Anywhere
          ...(proxyUrls[i].includes("cors-anywhere") && {
            "X-Requested-With": "XMLHttpRequest",
          }),
        },
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      let rawData;

      // Handle different proxy response formats
      if (proxyUrls[i].includes("allorigins")) {
        const proxyResponse = await response.json();
        if (proxyResponse.contents) {
          rawData = JSON.parse(proxyResponse.contents);
        } else {
          throw new Error("Invalid AllOrigins response format");
        }
      } else {
        rawData = await response.json();
      }

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("Invalid data format received");
      }

      const processedData = processThailandData(rawData);

      if (processedData.length === 0) {
        throw new Error("No valid data processed from response");
      }

      cachedData = processedData;
      lastFetch = Date.now();
      console.log(`Successfully loaded ${processedData.length} records from attempt ${i + 1}`);

      return cachedData;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      lastError = error;

      // ถ้าเป็น AbortError (timeout) ให้ลองต่อ
      if (error.name === "AbortError") {
        console.log(`Attempt ${i + 1} timed out, trying next proxy...`);
        continue;
      }

      // ถ้าเป็น network error ให้ลองต่อ
      if (error.message.includes("fetch") || error.message.includes("network")) {
        console.log(`Attempt ${i + 1} network error, trying next proxy...`);
        continue;
      }

      // ถ้าเป็น error อื่นๆ ให้ลองต่อ
      continue;
    }
  }

  // ถ้าทุก proxy ล้มเหลว
  console.error("All proxy attempts failed");
  throw new Error(
    `Failed to fetch Thailand address data after ${proxyUrls.length} attempts. Last error: ${lastError?.message || "Unknown error"}`,
  );
}

function processThailandData(rawData) {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item) => ({
    subdistrict: item[0] || "",
    district: item[1] || "",
    province: item[2] || "",
    postalCode: item[3] || "",
  }));
}

export async function GET(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting: 30 requests per minute for postal code
    const rateCheck = rateLimiter.checkRateLimit(ip, 60000, 30);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "คำขอมากเกินไป กรุณาลองใหม่ในอีกสักครู่",
        },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const subDistrict = searchParams.get("subDistrict");

    if (!subDistrict) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุตำบล/แขวง",
        },
        { status: 400 },
      );
    }

    // Check cache
    const cacheKey = `postal_${subDistrict.toLowerCase()}`;
    const cached = rateLimiter.getCached(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    // Directly fetch and process thailand data instead of making internal HTTP call
    const data = await fetchThailandData();
    const searchTerm = subDistrict.toLowerCase().trim();

    const filteredData = data
      .filter((item) => item.subdistrict.toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        const aStartsWith = a.subdistrict.toLowerCase().startsWith(searchTerm);
        const bStartsWith = b.subdistrict.toLowerCase().startsWith(searchTerm);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return a.subdistrict.localeCompare(b.subdistrict, "th");
      })
      .slice(0, 10);

    if (filteredData && filteredData.length > 0) {
      // Cache for 10 minutes
      rateLimiter.setCache(cacheKey, filteredData, 600000);

      return NextResponse.json({
        success: true,
        data: filteredData,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "ไม่พบข้อมูลรหัสไปรษณีย์สำหรับตำบล/แขวงนี้",
      });
    }
  } catch (error) {
    console.error("Error fetching postal code:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการดึงข้อมูลรหัสไปรษณีย์: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
