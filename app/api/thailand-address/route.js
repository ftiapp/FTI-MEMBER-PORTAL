// app/api/thailand-address/route.js
import { NextResponse } from "next/server";

let cachedData = null;
let lastFetch = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

async function fetchThailandData() {
  // ถ้ามี cache และยังไม่หมดอายุ
  if (cachedData && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
    return cachedData;
  }

  try {
    console.log("Fetching Thailand address data from server...");

    // ดึงข้อมูลจาก GitHub (server-side จะไม่โดน CORS)
    const response = await fetch(
      "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Thailand-Address-API/1.0)",
        },
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

// GET method for fetching all data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "subdistrict";

    const data = await fetchThailandData();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Please provide query parameter",
      });
    }

    let filteredData = [];
    const searchTerm = query.toLowerCase().trim();

    if (type === "subdistrict") {
      filteredData = data
        .filter((item) => item.subdistrict.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.subdistrict.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.subdistrict.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return a.subdistrict.localeCompare(b.subdistrict, "th");
        })
        .slice(0, 10);
    } else if (type === "postalCode") {
      filteredData = data.filter((item) => item.postalCode.includes(searchTerm)).slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Thailand address data",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
