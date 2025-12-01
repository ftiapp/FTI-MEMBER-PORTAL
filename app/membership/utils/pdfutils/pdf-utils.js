// pdf-utils.js - ฟังก์ชันช่วยเหลือ

import { THAI_MONTHS, BUSINESS_TYPE_NAMES } from "./pdf-config.js";

// Format Thai date
export const formatThaiDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// Transform Cloudinary URL
export const transformCloudinaryUrl = (url) => {
  try {
    if (!url) return url;
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;

    const parts = u.pathname.split("/");
    const uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return url;

    const nextPart = parts[uploadIdx + 1] || "";
    const isVersion = /^v\d+$/.test(nextPart);
    const isTransform = nextPart && !isVersion && !nextPart.includes(".");
    const inject = "pg_1,f_auto,q_auto:eco,w_600";

    if (isVersion) {
      parts.splice(uploadIdx + 1, 0, inject);
    } else if (isTransform) {
      if (!nextPart.includes("f_auto")) {
        parts[uploadIdx + 1] = `${inject},${nextPart}`;
      }
    } else {
      parts.splice(uploadIdx + 1, 0, inject);
    }

    u.pathname = parts.join("/");
    return u.toString();
  } catch {
    return url;
  }
};

// Load remote image as Data URL
export const loadImageAsDataURL = async (url) => {
  if (!url) return null;
  console.debug(`[PDF] Attempting to load image: ${url}`);

  try {
    let res;
    try {
      res = await fetch(url);
      if (!res.ok) {
        res = await fetch(url, { mode: "cors" });
      }
    } catch (err) {
      res = await fetch(url, { mode: "cors" });
    }

    if (!res.ok) return null;
    const blob = await res.blob();

    if (!(blob && blob.type && blob.type.startsWith("image/"))) {
      return null;
    }

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Error loading image:", err);
    return null;
  }
};

// Resolve prename for display
export const resolvePrename = (prenameTh, prenameEn, prenameOther, lang = "th") => {
  const normTh = (prenameTh || "").trim();
  const normEn = (prenameEn || "").trim();
  const normOther = (prenameOther || "").trim();

  if (lang === "th") {
    if (!normTh && !normOther) return "";
    if (/^อื่นๆ$/i.test(normTh) || /^other$/i.test(normEn)) return normOther || "";
    return normTh || normOther || "";
  } else {
    if (!normEn && !normOther) return "";
    if (/^other$/i.test(normEn) || /^อื่นๆ$/i.test(normTh)) return normOther || "";
    return normEn || normOther || "";
  }
};

// Number format helper
export const formatNumber = (v) => {
  if (v === 0 || v === "0") return "0";
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
};

// Pick name from object
export const pickName = (obj, keys) => keys.map((k) => obj?.[k]).find(Boolean);

// Get business type names
export const getBusinessTypeNames = (app) => {
  const names = BUSINESS_TYPE_NAMES;

  let src =
    app.businessTypes || app.business_types || app.businessType || app.business_type || null;
  if (!src) return "-";

  // String (comma separated)
  if (typeof src === "string") {
    return src
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => names[s] || s)
      .join(", ");
  }

  // Array of primitives
  if (Array.isArray(src) && src.length && typeof src[0] !== "object") {
    return src.map((k) => names[k] || String(k)).join(", ");
  }

  // Array of objects
  if (Array.isArray(src)) {
    return src
      .map((bt) => {
        const named = bt.businessTypeName || bt.name_th || bt.nameTh || bt.label || bt.name;
        if (named) return named;
        const key = bt.id || bt.key || bt.business_type || bt.type;
        if (key === "other") {
          const other =
            Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
              ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
              : app.businessTypeOther?.detail;
          return `อื่นๆ: ${other || "-"}`;
        }
        return names[key] || key;
      })
      .join(", ");
  }

  // Object format
  return Object.entries(src)
    .filter(([k, v]) => v)
    .map(([k]) => {
      if (k === "other") {
        const other =
          Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
            ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
            : app.businessTypeOther?.detail || app.otherBusinessTypeDetail;
        return `อื่นๆ: ${other || "-"}`;
      }
      return names[k] || k;
    })
    .join(", ");
};
