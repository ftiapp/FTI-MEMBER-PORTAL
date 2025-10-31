import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceParam = searchParams.get("province");
    const search = searchParams.get("search");

    console.log("🗺️ Districts API called with province:", provinceParam);

    if (!provinceParam) {
      return NextResponse.json(
        {
          success: false,
          message: "Province parameter is required",
        },
        { status: 400 },
      );
    }

    // Handle province with or without prefix
    let cleanProvinceName = provinceParam.trim();
    if (cleanProvinceName.startsWith("จังหวัด")) {
      cleanProvinceName = cleanProvinceName.replace("จังหวัด", "").trim();
    }

    console.log("🔍 Looking for province:", cleanProvinceName);

    // Call the search API for districts in this province
    const searchUrl = new URL(`${request.nextUrl.origin}/api/thailand-address/search`);
    searchUrl.searchParams.set("type", "district");
    searchUrl.searchParams.set("query", search || ""); // Get all districts if no search

    console.log("📡 Calling search API:", searchUrl.toString());

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    console.log("📥 Search API response:", data);

    if (data.success && data.data) {
      // Filter districts by province and deduplicate
      const districtsMap = new Map();
      data.data.forEach((item) => {
        // Check if this district belongs to the requested province
        if (item.province === cleanProvinceName) {
          if (!districtsMap.has(item.text)) {
            districtsMap.set(item.text, {
              code: (districtsMap.size + 1).toString().padStart(4, "0"),
              name_th: item.text,
              name_en: item.text,
            });
          }
        }
      });

      const districts = Array.from(districtsMap.values());

      if (search) {
        // Additional filtering by search term (already done by search API, but we'll ensure)
        const filteredDistricts = districts.filter(
          (district) =>
            district.name_th.toLowerCase().includes(search.toLowerCase()) ||
            district.name_en.toLowerCase().includes(search.toLowerCase()),
        );

        console.log("✅ Districts filtered by search:", filteredDistricts.length);

        return NextResponse.json({
          success: true,
          data: filteredDistricts,
          total: filteredDistricts.length,
        });
      }

      console.log("✅ Districts loaded:", districts.length);

      return NextResponse.json({
        success: true,
        data: districts,
        total: districts.length,
      });
    } else {
      console.error("❌ Search API failed:", data.message);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch districts",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error fetching districts:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch districts: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
