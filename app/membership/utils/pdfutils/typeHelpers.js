// Type helper functions

// Get title by type
export const getTitleByType = (type) =>
  ({
    ic: "เอกสารสมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)",
    oc: "เอกสารสมัครสมาชิก สามัญ-โรงงาน (สน)",
    ac: "เอกสารสมัครสมาชิก สมทบ-นิติบุคคล (ทน)",
    am: "เอกสารสมัครสมาชิก สามัญ-สมาคมการค้า (สส)",
  })[type] || "ข้อมูลสมาชิก";

// Get business type names
export const getBusinessTypeNames = (app) => {
  const names = {
    manufacturer: "ผู้ผลิต",
    distributor: "ผู้จัดจำหน่าย",
    importer: "ผู้นำเข้า",
    exporter: "ผู้ส่งออก",
    service: "ผู้ให้บริการ",
    service_provider: "ผู้ให้บริการ",
    other: "อื่นๆ",
  };

  // Normalize possible sources
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

  // Array of primitives (ids/labels)
  if (Array.isArray(src) && src.length && typeof src[0] !== "object") {
    return src.map((k) => names[k] || String(k)).join(", ");
  }

  // Array of objects
  if (Array.isArray(src)) {
    return src
      .map((bt) => {
        // Prefer explicit name from API
        const named = bt.businessTypeName || bt.name_th || bt.nameTh || bt.label || bt.name;
        if (named) return named;
        const key = bt.id || bt.key || bt.business_type || bt.type;
        if (key === "other") {
          // API may provide array of other types: [{ otherType }]
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

  // Object format from form: { manufacturer: true, ... }
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
