import React, { useState, useEffect } from "react";

const BUSINESS_TYPES = {
  manufacturer: "ผู้ผลิต",
  distributor: "ผู้จัดจำหน่าย",
  importer: "ผู้นำเข้า",
  exporter: "ผู้ส่งออก",
  service: "ผู้ให้บริการ",
  other: "อื่นๆ",
};

const MAX_PRODUCTS = 5;

const BusinessInfoSection = ({ application, onUpdate }) => {
  if (!application) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-red-600">ไม่มีข้อมูล application</h3>
      </div>
    );
  }

  // ดึงข้อมูลจาก application
  const businessTypesData = application.businessTypes || [];
  const productsData = application.products || [];
  const businessTypeOtherData = application.businessTypeOther || [];

  const normalizeProducts = (productArray) => {
    if (!Array.isArray(productArray)) return [];
    return productArray.map((product) => ({
      name_th: product?.name_th ?? product?.nameTh ?? "",
      name_en: product?.name_en ?? product?.nameEn ?? "",
    }));
  };

  // แปลง businessTypes เป็น array ของ objects { type, detail }
  const getBusinessTypeObjects = () => {
    // Case 1: already array of objects
    if (Array.isArray(businessTypesData)) {
      return businessTypesData
        .map((item) => {
          if (typeof item === "string") {
            return { type: item, detail: null };
          }
          return {
            type: item?.business_type || item?.type || "",
            detail: item?.detail || null,
          };
        })
        .filter((obj) => obj.type);
    }
    // Case 2: object map e.g. { manufacturer: 1, exporter: true }
    if (businessTypesData && typeof businessTypesData === "object") {
      return Object.keys(businessTypesData)
        .filter((k) => !!businessTypesData[k])
        .map((k) => ({ type: k, detail: null }));
    }
    return [];
  };

  // แปลงเป็น array ของ string สำหรับ state
  const getBusinessTypeStrings = () => {
    return getBusinessTypeObjects().map((obj) => obj.type);
  };

  // ดึง detail จาก businessTypes หรือ businessTypeOther
  const getOtherDetail = () => {
    // ลองหา detail จาก businessTypes ก่อน
    const typeObjs = getBusinessTypeObjects();
    const otherObj = typeObjs.find((obj) => obj.type === "other");
    if (otherObj?.detail) {
      return otherObj.detail;
    }
    // ถ้าไม่มี ลองหาจาก businessTypeOther
    if (Array.isArray(businessTypeOtherData) && businessTypeOtherData.length > 0) {
      return businessTypeOtherData[0]?.detail || "";
    }
    return "";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(getBusinessTypeStrings());
  const [otherText, setOtherText] = useState(getOtherDetail());
  const [products, setProducts] = useState(normalizeProducts(productsData));
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when application prop changes (after successful update)
  useEffect(() => {
    if (!isEditing && application) {
      // Re-compute from latest application data
      const businessTypesData = application.businessTypes || [];
      const productsData = application.products || [];
      const businessTypeOtherData = application.businessTypeOther || [];

      // แปลง businessTypes เป็น array ของ string
      const getBusinessTypeStringsLocal = () => {
        if (Array.isArray(businessTypesData)) {
          return businessTypesData
            .map((item) => {
              if (typeof item === "string") return item;
              return item?.business_type || item?.type || "";
            })
            .filter((type) => type);
        }
        if (businessTypesData && typeof businessTypesData === "object") {
          return Object.keys(businessTypesData).filter((k) => !!businessTypesData[k]);
        }
        return [];
      };

      // ดึง detail จาก businessTypes หรือ businessTypeOther
      const getOtherDetailLocal = () => {
        if (Array.isArray(businessTypesData)) {
          const otherObj = businessTypesData.find(
            (obj) => (obj?.business_type || obj?.type) === "other",
          );
          if (otherObj?.detail) return otherObj.detail;
        }
        if (Array.isArray(businessTypeOtherData) && businessTypeOtherData.length > 0) {
          return businessTypeOtherData[0]?.detail || "";
        }
        return "";
      };

      setSelectedTypes(getBusinessTypeStringsLocal());
      setOtherText(getOtherDetailLocal());
      setProducts(normalizeProducts(productsData));
    }
  }, [application, isEditing]);

  const toggleType = (key) => {
    if (selectedTypes.includes(key)) {
      setSelectedTypes(selectedTypes.filter((k) => k !== key));
    } else {
      setSelectedTypes([...selectedTypes, key]);
    }
  };

  const addProduct = () => {
    if (products.length >= MAX_PRODUCTS) {
      return;
    }

    setProducts([...products, { name_th: "", name_en: "" }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      // บันทึกประเภทธุรกิจ
      await onUpdate("businessTypes", {
        businessTypes: selectedTypes,
        businessTypeOther: selectedTypes.includes("other") ? otherText.trim() : null,
      });

      // บันทึกสินค้า/บริการ
      await onUpdate("products", {
        products: products.map((p) => ({
          name_th: p.name_th || "",
          name_en: p.name_en || "",
        })),
      });

      // ข้อมูลจะอัปเดตทันทีผ่าน state ไม่ต้อง reload
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedTypes(getBusinessTypeStrings());
    setOtherText(getOtherDetail());
    setProducts(normalizeProducts(productsData));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-600">ข้อมูลธุรกิจ</h3>
        {onUpdate &&
          (!isEditing ? (
            <button
              onClick={() => {
                // initialize edit buffers from latest props
                setSelectedTypes(getBusinessTypeStrings());
                setOtherText(getOtherDetail());
                setProducts(normalizeProducts(productsData));
                setIsEditing(true);
              }}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              แก้ไข
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                ยกเลิก
              </button>
            </div>
          ))}
      </div>

      {/* ประเภทธุรกิจ - โหมดดู */}
      {!isEditing && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
          {getBusinessTypeStrings().length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {getBusinessTypeStrings().map(
                (key, index) =>
                  key !== "other" && (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {BUSINESS_TYPES[key] || key}
                    </span>
                  ),
              )}
              {getBusinessTypeStrings().includes("other") && getOtherDetail() && (
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                  อื่นๆ: {getOtherDetail()}
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">ยังไม่ได้เลือกประเภทธุรกิจ</p>
          )}
        </div>
      )}

      {/* ประเภทธุรกิจ - โหมดแก้ไข */}
      {isEditing && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(BUSINESS_TYPES).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={selectedTypes.includes(key)}
                  onChange={() => toggleType(key)}
                  disabled={isSaving}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          {selectedTypes.includes("other") && (
            <div className="mt-3">
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุรายละเอียดอื่นๆ"
                disabled={isSaving}
              />
            </div>
          )}
        </div>
      )}

      {/* สินค้าและบริการ - โหมดดู */}
      {!isEditing && (
        <div>
          <h4 className="text-lg font-medium mb-3 text-black">สินค้าและบริการ</h4>
          {(productsData || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(productsData || []).map((product, index) => {
                // รองรับทั้ง snake_case และ camelCase
                const nameTh = product.name_th || product.nameTh || "-";
                const nameEn = product.name_en || product.nameEn || "-";

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">ชื่อ (ไทย)</p>
                    <p className="font-medium mb-2">{nameTh}</p>
                    <p className="text-sm text-gray-600">ชื่อ (อังกฤษ)</p>
                    <p className="font-medium">{nameEn}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">ยังไม่มีข้อมูลสินค้า/บริการ</p>
          )}
        </div>
      )}

      {/* สินค้าและบริการ - โหมดแก้ไข */}
      {isEditing && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-black">สินค้าและบริการ</h4>
            <button
              onClick={addProduct}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSaving || products.length >= MAX_PRODUCTS}
            >
              + เพิ่ม ({products.length} / {MAX_PRODUCTS})
            </button>
          </div>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-black">
                      สินค้า/บริการ #{index + 1}
                    </span>
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isSaving}
                    >
                      ลบ
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm mb-1 text-black">ชื่อ (ไทย)</label>
                      <input
                        type="text"
                        value={product.name_th || ""}
                        onChange={(e) => updateProduct(index, "name_th", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ระบุชื่อสินค้า/บริการภาษาไทย"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-black">ชื่อ (อังกฤษ)</label>
                      <input
                        type="text"
                        value={product.name_en || ""}
                        onChange={(e) => updateProduct(index, "name_en", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ระบุชื่อสินค้า/บริการภาษาอังกฤษ"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm text-center py-4">
              ยังไม่มีสินค้า/บริการ คลิก "+ เพิ่ม" เพื่อเพิ่มข้อมูล
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessInfoSection;
