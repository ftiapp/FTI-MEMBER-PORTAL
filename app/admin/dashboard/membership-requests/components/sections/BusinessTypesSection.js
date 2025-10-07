import React, { useMemo, useState, useEffect } from "react";

const BUSINESS_TYPES = [
  { key: "manufacturer", label: "ผู้ผลิต" },
  { key: "distributor", label: "ผู้จัดจำหน่าย" },
  { key: "exporter", label: "ผู้ส่งออก" },
  { key: "importer", label: "ผู้นำเข้า" },
  { key: "service", label: "ผู้ให้บริการ" },
  { key: "other", label: "อื่นๆ (โปรดระบุ)" },
];

const BusinessTypesSection = ({ application, onUpdate }) => {
  // Normalize initial values
  const initialSelected = useMemo(() => {
    if (Array.isArray(application?.businessTypes)) return application.businessTypes;
    return [];
  }, [application]);

  const initialOther = useMemo(() => {
    // For OC/AC/AM route, businessTypeOther is an array of rows; take first.detail or first.other_type
    const other = application?.businessTypeOther;
    if (Array.isArray(other) && other.length > 0) {
      return other[0]?.detail || other[0]?.other_type || "";
    }
    if (typeof other === "string") return other;
    return "";
  }, [application]);

  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(initialSelected);
  const [otherText, setOtherText] = useState(initialOther);

  useEffect(() => {
    if (!isEditing) {
      setSelected(initialSelected);
      setOtherText(initialOther);
    }
  }, [initialSelected, initialOther, isEditing]);

  const toggleType = (key) => {
    setSelected((prev) => {
      const has = prev.includes(key);
      if (has) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  };

  const handleSave = async () => {
    const payload = {
      businessTypes: selected,
      businessTypeOther: selected.includes("other") ? otherText?.trim() : null,
    };
    await onUpdate("businessTypes", payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelected(initialSelected);
    setOtherText(initialOther);
  };

  const selectedLabels = BUSINESS_TYPES.filter((b) => selected.includes(b.key)).map((b) => b.label);

  // Determine if there is any data to show
  const hasData = (application?.businessTypes?.length || 0) > 0 || (initialOther?.length || 0) > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ประเภทธุรกิจ</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไข
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              บันทึก
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              ยกเลิก
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2">
          {hasData ? (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(application?.businessTypes) ? application.businessTypes : selected).map((key, i) => {
                const bt = BUSINESS_TYPES.find((b) => b.key === key);
                if (!bt || key === "other") return null;
                return (
                  <span key={`${key}-${i}`} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {bt.label}
                  </span>
                );
              })}
              { (initialOther || otherText) && (
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                  อื่นๆ: {initialOther || otherText || "ไม่ระบุ"}
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">ยังไม่ได้เลือกประเภทธุรกิจ</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BUSINESS_TYPES.map((bt) => (
              <label key={bt.key} className="flex items-center gap-3 px-4 py-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={selected.includes(bt.key)}
                  onChange={() => toggleType(bt.key)}
                />
                <span className="text-gray-900">{bt.label}</span>
              </label>
            ))}
          </div>

          {selected.includes("other") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ระบุรายละเอียดอื่นๆ</label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น ตัวแทนจำหน่ายเฉพาะทาง ..."
              />
              <p className="text-xs text-gray-500 mt-1">จะถูกบันทึกในตาราง BusinessTypeOther</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessTypesSection;
