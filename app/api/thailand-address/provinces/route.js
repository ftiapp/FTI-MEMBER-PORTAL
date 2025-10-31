import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    console.log(" Provinces API called, search:", search);

    // Call the search API for provinces
    const searchUrl = new URL(`${request.nextUrl.origin}/api/thailand-address/search`);
    searchUrl.searchParams.set("type", "province");

    if (search) {
      searchUrl.searchParams.set("query", search);
    } else {
      // Get all provinces by searching with empty string
      searchUrl.searchParams.set("query", "");
    }

    console.log(" Calling search API:", searchUrl.toString());

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    console.log(" Search API response:", data);

    if (data.success && data.data) {
      // Transform to match expected format
      const provinces = data.data.map((item, index) => ({
        code: (index + 1).toString().padStart(2, "0"),
        name_th: item.text || item.id,
        name_en: item.text || item.id,
      }));

      console.log(" Provinces loaded:", provinces.length);

      return NextResponse.json({
        success: true,
        data: provinces,
        total: provinces.length,
      });
    } else {
      console.error(" Search API failed:", data.message);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch provinces",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(" Error fetching provinces:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch provinces: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
