import React from "react";

const BusinessInfoSection = ({ businessTypes, products, businessTypeOther }) => {
  if (
    (!businessTypes || businessTypes.length === 0) &&
    (!products || products.length === 0) &&
    (!businessTypeOther || businessTypeOther.length === 0)
  ) {
    return null;
  }

  const getBusinessTypeName = (type) => {
    const types = {
      manufacturer: "ผู้ผลิต",
      distributor: "ผู้จัดจำหน่าย",
      importer: "ผู้นำเข้า",
      exporter: "ผู้ส่งออก",
      service: "ผู้ให้บริการ",
      other: "อื่นๆ",
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลธุรกิจ</h3>

      {/* ประเภทธุรกิจ */}
      {businessTypes && businessTypes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
          <div className="flex flex-wrap gap-2">
            {businessTypes.map((businessType, index) => {
              // If business type is 'other', show the detail from businessTypeOther
              if (
                businessType.business_type === "other" &&
                businessTypeOther &&
                businessTypeOther.length > 0
              ) {
                const otherDetail = businessTypeOther.find(
                  (other) => other.main_id === businessType.main_id,
                );
                return (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    อื่นๆ: {otherDetail?.detail || "ไม่ระบุ"}
                  </span>
                );
              }
              return (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {getBusinessTypeName(businessType.business_type)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* สินค้าและบริการ */}
      {products && products.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">สินค้าและบริการ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, index) => (
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

      {/* Note: Other business types are now integrated above when business_type is 'other' */}
    </div>
  );
};

export default BusinessInfoSection;
