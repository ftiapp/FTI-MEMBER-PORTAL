import React, { useState } from "react";
import { getBusinessTypeName } from "../../ีutils/dataTransformers";

const ProductsSection = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    businessTypes: application?.businessTypes || [],
    products: application?.products || [],
  });

  const hasBusinessTypes = application?.businessTypes?.length > 0;
  const hasProducts = application?.products?.length > 0;

  if (!hasBusinessTypes && !hasProducts) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      businessTypes: application?.businessTypes || [],
      products: application?.products || [],
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate("products", editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating products:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      businessTypes: application?.businessTypes || [],
      products: application?.products || [],
    });
  };

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...editData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditData({ ...editData, products: updatedProducts });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ข้อมูลธุรกิจและสินค้า</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไขข้อมูลธุรกิจและสินค้า"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              บันทึก
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              ยกเลิก
            </button>
          </div>
        )}
      </div>

      {hasBusinessTypes && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
          <div className="flex flex-wrap gap-2">
            {application.businessTypes.map((businessType, index) => {
              const typeName = getBusinessTypeName(businessType);
              const isOther = businessType.type === "other";

              return (
                <span
                  key={index}
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${
                    isOther
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {typeName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {hasProducts && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isEditing ? editData.products : application.products).map((product, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-lg font-bold text-blue-900 mb-3">สินค้า/บริการ {index + 1}</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={product.nameTh || ""}
                        onChange={(e) => updateProduct(index, "nameTh", e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ชื่อสินค้า/บริการ (ไทย)"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{product.nameTh || "-"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={product.nameEn || ""}
                        onChange={(e) => updateProduct(index, "nameEn", e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ชื่อสินค้า/บริการ (อังกฤษ)"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{product.nameEn || "-"}</p>
                    )}
                  </div>
                  {product.description && (
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">รายละเอียด</p>
                      {isEditing ? (
                        <textarea
                          value={product.description || ""}
                          onChange={(e) => updateProduct(index, "description", e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="รายละเอียดสินค้า/บริการ"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{product.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
