import React, { useMemo, useState, useEffect } from "react";

const BUSINESS_TYPES = {
  manufacturer: "ผู้ผลิต",
  distributor: "ผู้จัดจำหน่าย",
  importer: "ผู้นำเข้า",
  exporter: "ผู้ส่งออก",
  service: "ผู้ให้บริการ",
  other: "อื่นๆ",
};

// Accept full application to make editing easier; keep backward compatibility with existing props
const BusinessInfoSection = ({ application, businessTypes, products, businessTypeOther, onUpdate }) => {
  const normalizeTypes = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((v) => (typeof v === "string" ? v : v?.business_type || v?.type || v?.businessType || v?.key))
      .filter(Boolean);

  const viewBusinessTypes = useMemo(() => {
    if (Array.isArray(application?.businessTypes)) return normalizeTypes(application.businessTypes);
    return normalizeTypes(businessTypes);
  }, [application, businessTypes]);

  const viewProducts = useMemo(() => {
    if (Array.isArray(application?.products)) return application.products;
    return Array.isArray(products) ? products : [];
  }, [application, products]);

  const viewOtherRaw = useMemo(() => {
    const other = application?.businessTypeOther ?? businessTypeOther;
    if (Array.isArray(other) && other.length > 0) return other[0]?.detail || other[0]?.other_type || "";
    if (typeof other === "string") return other;
    return "";
  }, [application, businessTypeOther]);

  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(viewBusinessTypes);
  const [otherText, setOtherText] = useState(viewOtherRaw);

  useEffect(() => {
    if (!isEditing) {
      setSelected(viewBusinessTypes);
      setOtherText(viewOtherRaw);
    }
  }, [viewBusinessTypes, viewOtherRaw, isEditing]);

  const toggleType = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSave = async () => {
    if (!onUpdate) return setIsEditing(false);
    await onUpdate("businessTypes", {
      businessTypes: selected,
      businessTypeOther: selected.includes("other") ? otherText?.trim() : null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelected(viewBusinessTypes);
    setOtherText(viewOtherRaw);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-600">ข้อมูลธุรกิจ</h3>
        {onUpdate && (
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไข
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">บันทึก</button>
              <button onClick={handleCancel} className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">ยกเลิก</button>
            </div>
          )
        )}
      </div>

      {/* ประเภทธุรกิจ */}
      {(!isEditing && (viewBusinessTypes && viewBusinessTypes.length > 0)) && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
          <div className="flex flex-wrap gap-2">
            {viewBusinessTypes.map((key, index) => (
              key === "other" ? null : (
                <span key={`${key}-${index}`} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {BUSINESS_TYPES[key] || key}
                </span>
              )
            ))}
            {(viewOtherRaw) && (
              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">อื่นๆ: {viewOtherRaw}</span>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(BUSINESS_TYPES).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 px-4 py-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={selected.includes(key)}
                  onChange={() => toggleType(key)}
                />
                <span className="text-gray-900">{label}</span>
              </label>
            ))}
          </div>
          {selected.includes("other") && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">ระบุรายละเอียดอื่นๆ</label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น ตัวแทนจำหน่ายเฉพาะทาง ..."
              />
            </div>
          )}
        </div>
      )}

      {/* สินค้าและบริการ */}
      {viewProducts && viewProducts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">สินค้าและบริการ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewProducts.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (ไทย)</p>
                    <p className="font-medium">{product.name_th || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                    <p className="font-medium">{product.name_en || "-"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* หมายเหตุ: รายละเอียดอื่นๆ ถูกแสดงรวมด้านบนแล้ว */}
    </div>
  );
};

export default BusinessInfoSection;
