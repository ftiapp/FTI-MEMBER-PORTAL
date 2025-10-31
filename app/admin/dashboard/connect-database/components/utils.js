// Helper function to map member types to Thai abbreviations
export const getMemberTypeAbbr = (type) => {
  switch (type) {
    case "OC":
      return "สน";
    case "IC":
      return "ทบ";
    case "AM":
      return "สส";
    case "AC":
      return "ทน";
    default:
      return type || "";
  }
};

// Helper function to map member types to Thai descriptions
export const getMemberTypeDescription = (type) => {
  switch (type) {
    case "OC":
      return "สน (โรงงาน)";
    case "AC":
      return "ทน (นิติบุคคล)";
    case "AM":
      return "สส (สมาคมการค้า)";
    case "IC":
      return "ทบ (บุคคลธรรมดา)";
    default:
      return type || "-";
  }
};

// Helper function to get member type color classes
export const getMemberTypeColorClasses = (type) => {
  switch (type) {
    case "OC":
      return "bg-blue-100 text-blue-800";
    case "AC":
      return "bg-green-100 text-green-800";
    case "AM":
      return "bg-purple-100 text-purple-800";
    case "IC":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Utility to format dates in Thai locale with timezone handling
export const formatThaiDate = (value) => {
  if (!value) return "-";

  const parseDate = (raw) => {
    if (raw instanceof Date) {
      return Number.isNaN(raw.getTime()) ? null : raw;
    }

    if (typeof raw === "number") {
      const ts = raw > 1e12 ? raw : raw * 1000;
      const date = new Date(ts);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof raw !== "string") {
      return null;
    }

    let normalized = raw.trim();
    if (!normalized) return null;

    if (/^\d+$/.test(normalized)) {
      const numeric = Number(normalized);
      const date = new Date(normalized.length > 10 ? numeric : numeric * 1000);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Try parsing common ISO formats
    if (normalized.includes("T") && normalized.includes("Z")) {
      const date = new Date(normalized);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Try parsing with Date constructor (handles many formats)
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    return null;
  };

  const parsed = parseDate(value);
  if (!parsed) return "-";

  try {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bangkok",
    };

    const thaiFormatter = new Intl.DateTimeFormat("th-TH", options);
    const parts = thaiFormatter.formatToParts(parsed);

    // Convert Buddhist year (BE) to Gregorian year minus 543
    const yearPart = parts.find((p) => p.type === "year");
    if (yearPart) {
      const beYear = Number.parseInt(yearPart.value, 10);
      const adYear = beYear - 543;
      yearPart.value = adYear.toString();
    }

    return parts.map((p) => p.value).join("");
  } catch (e) {
    // Fallback format
    return parsed.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};
