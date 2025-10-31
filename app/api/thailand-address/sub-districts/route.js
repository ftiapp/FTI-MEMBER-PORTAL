import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceParam = searchParams.get("province");
    const districtParam = searchParams.get("district");
    const search = searchParams.get("search");

    console.log(
      "🏘️ Sub-districts API called with province:",
      provinceParam,
      "district:",
      districtParam,
    );

    if (!provinceParam || !districtParam) {
      return NextResponse.json(
        {
          success: false,
          message: "Both province and district parameters are required",
        },
        { status: 400 },
      );
    }

    // Handle province with or without prefix
    let cleanProvinceName = provinceParam.trim();
    if (cleanProvinceName.startsWith("จังหวัด")) {
      cleanProvinceName = cleanProvinceName.replace("จังหวัด", "").trim();
    }

    // Handle district with or without prefix
    let cleanDistrictName = districtParam.trim();
    cleanDistrictName = cleanDistrictName.replace("อำเภอ", "").trim();
    cleanDistrictName = cleanDistrictName.replace("เขต", "").trim();

    console.log("🔍 Looking for province:", cleanProvinceName, "district:", cleanDistrictName);

    // Call the search API for sub-districts in this district and province
    const searchUrl = new URL(`${request.nextUrl.origin}/api/thailand-address/search`);
    searchUrl.searchParams.set("type", "subdistrict");
    searchUrl.searchParams.set("query", search || ""); // Get all sub-districts if no search

    console.log("📡 Calling search API:", searchUrl.toString());

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    console.log("📥 Search API response:", data);

    if (data.success && data.data) {
      // Filter sub-districts by both province and district, and deduplicate
      const subDistrictsMap = new Map();
      data.data.forEach((item) => {
        // Check if this sub-district belongs to the requested province AND district
        if (item.province === cleanProvinceName && item.district === cleanDistrictName) {
          if (!subDistrictsMap.has(item.text)) {
            subDistrictsMap.set(item.text, {
              code: (subDistrictsMap.size + 1).toString().padStart(6, "0"),
              name_th: item.text,
              name_en: item.text,
            });
          }
        }
      });

      let subDistricts = Array.from(subDistrictsMap.values());

      if (search) {
        // Additional filtering by search term (already done by search API, but we'll ensure)
        subDistricts = subDistricts.filter(
          (subDistrict) =>
            subDistrict.name_th.toLowerCase().includes(search.toLowerCase()) ||
            subDistrict.name_en.toLowerCase().includes(search.toLowerCase()),
        );

        console.log("✅ Sub-districts filtered by search:", subDistricts.length);
      }

      console.log("✅ Sub-districts loaded:", subDistricts.length);

      return NextResponse.json({
        success: true,
        data: subDistricts,
        total: subDistricts.length,
      });
    } else {
      console.error("❌ Search API failed:", data.message);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch sub-districts",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error fetching sub-districts:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch sub-districts: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
