import React, { useState } from "react";
import { toast } from "react-hot-toast";

const AddressSectionEnhanced = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application?.addresses || []);
  const [postalCodeSuggestions, setPostalCodeSuggestions] = useState({});
  const [loadingPostalCode, setLoadingPostalCode] = useState({});

  // Check if we have multiple addresses or just one
  const hasMultipleAddresses = application?.addresses && application.addresses.length > 0;
  const hasSingleAddress = application?.address && !hasMultipleAddresses;

  if (!hasMultipleAddresses && !hasSingleAddress) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(application?.addresses ? [...application.addresses] : [application.address]);
  };

  const handleSave = async () => {
    try {
      await onUpdate("addresses", editData);
      setIsEditing(false);
      toast.success("บันทึกข้อมูลที่อยู่สำเร็จ");
    } catch (error) {
      console.error("Error updating addresses:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลที่อยู่ได้");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(application?.addresses ? [...application.addresses] : [application.address]);
    setPostalCodeSuggestions({});
  };

  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...editData];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setEditData(updatedAddresses);
  };

  // Copy address from office (type 1) to other types
  const copyFromOffice = (targetIndex) => {
    const officeAddress = editData.find((addr) => addr.addressType === "1");
    if (!officeAddress) {
      toast.error("ไม่พบที่อยู่สำนักงานให้คัดลอก");
      return;
    }

    const updatedAddresses = [...editData];
    const targetType = updatedAddresses[targetIndex].addressType;
    
    updatedAddresses[targetIndex] = {
      ...officeAddress,
      addressType: targetType, // Keep original type
      id: updatedAddresses[targetIndex].id, // Keep original ID
    };
    
    setEditData(updatedAddresses);
    toast.success("คัดลอกที่อยู่สำเร็จ");
  };

  // Fetch address from postal code API
  const fetchAddressByPostalCode = async (postalCode, index) => {
    if (!postalCode || postalCode.length !== 5) {
      setPostalCodeSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    setLoadingPostalCode((prev) => ({ ...prev, [index]: true }));

    try {
      const response = await fetch(
        `https://api.thaiaddressdb.com/v1/postal_code/search?q=${postalCode}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setPostalCodeSuggestions((prev) => ({ ...prev, [index]: data }));
      } else {
        setPostalCodeSuggestions((prev) => ({ ...prev, [index]: [] }));
        toast.error("ไม่พบข้อมูลรหัสไปรษณีย์");
      }
    } catch (error) {
      console.error("Error fetching postal code:", error);
      toast.error("ไม่สามารถค้นหารหัสไปรษณีย์ได้");
    } finally {
      setLoadingPostalCode((prev) => ({ ...prev, [index]: false }));
    }
  };

  const selectPostalCodeSuggestion = (index, suggestion) => {
    const updatedAddresses = [...editData];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      subDistrict: suggestion.sub_district || suggestion.subDistrict,
      district: suggestion.district,
      province: suggestion.province,
      postalCode: suggestion.postal_code || suggestion.postalCode,
    };
    setEditData(updatedAddresses);
    setPostalCodeSuggestions((prev) => ({ ...prev, [index]: [] }));
    toast.success("เลือกที่อยู่สำเร็จ");
  };

  const getAddressTitle = (addressType) => {
    switch (addressType) {
      case "1":
        return "ที่อยู่สำนักงาน";
      case "2":
        return "ที่อยู่จัดส่งเอกสาร";
      case "3":
        return "ที่อยู่ใบกำกับภาษี";
      default:
        return `ที่อยู่ประเภท ${addressType}`;
    }
  };

  const getAddressStyles = (addressType) => {
    switch (addressType) {
      case "1":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-900",
          badge: "bg-blue-500",
        };
      case "2":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-900",
          badge: "bg-green-500",
        };
      case "3":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-900",
          badge: "bg-purple-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-900",
          badge: "bg-gray-500",
        };
    }
  };

  const renderAddressCard = (addr, title, index = 0) => {
    const addressType = addr.addressType || "1";
    const styles = getAddressStyles(addressType);
    const suggestions = postalCodeSuggestions[index] || [];
    const isLoadingPostal = loadingPostalCode[index] || false;

    return (
      <div key={index} className={`${styles.bg} border ${styles.border} rounded-lg p-6 mb-6`}>
        <div className="flex justify-between items-center mb-4 border-b ${styles.border} pb-2">
          <h4 className={`text-xl font-semibold ${styles.text}`}>{title}</h4>
          {isEditing && addressType !== "1" && (
            <button
              type="button"
              onClick={() => copyFromOffice(index)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              คัดลอกจากสำนักงาน
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อาคาร/หมู่บ้าน</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.building || ""}
                onChange={(e) => updateAddress(index, "building", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่ออาคาร/หมู่บ้าน"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.building || "-"}</p>
            )}
          </div>

          {/* Address Number */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.addressNumber || ""}
                onChange={(e) => updateAddress(index, "addressNumber", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="บ้านเลขที่"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.addressNumber || "-"}</p>
            )}
          </div>

          {/* Moo */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.moo || ""}
                onChange={(e) => updateAddress(index, "moo", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="หมู่"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.moo || "-"}</p>
            )}
          </div>

          {/* Soi */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.soi || ""}
                onChange={(e) => updateAddress(index, "soi", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ซอย"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.soi || "-"}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.street || ""}
                onChange={(e) => updateAddress(index, "street", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ถนน"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.street || "-"}</p>
            )}
          </div>

          {/* Postal Code with API */}
          <div className="relative">
            <p className="text-sm font-semibold text-blue-700 mb-1">
              รหัสไปรษณีย์ {isEditing && <span className="text-xs text-gray-500">(ค้นหาอัตโนมัติ)</span>}
            </p>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={addr.postalCode || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateAddress(index, "postalCode", value);
                    if (value.length === 5) {
                      fetchAddressByPostalCode(value, index);
                    }
                  }}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="รหัสไปรษณีย์ 5 หลัก"
                  maxLength={5}
                />
                {isLoadingPostal && (
                  <div className="absolute right-3 top-9 text-blue-500">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPostalCodeSuggestion(index, suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.sub_district || suggestion.subDistrict} →{" "}
                          {suggestion.district} → {suggestion.province}
                        </p>
                        <p className="text-xs text-gray-500">
                          รหัสไปรษณีย์: {suggestion.postal_code || suggestion.postalCode}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-base text-gray-900 font-mono">{addr.postalCode || "-"}</p>
            )}
          </div>

          {/* Sub District */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.subDistrict || ""}
                onChange={(e) => updateAddress(index, "subDistrict", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ตำบล/แขวง"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.subDistrict || "-"}</p>
            )}
          </div>

          {/* District */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.district || ""}
                onChange={(e) => updateAddress(index, "district", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="อำเภอ/เขต"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.district || "-"}</p>
            )}
          </div>

          {/* Province */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.province || ""}
                onChange={(e) => updateAddress(index, "province", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="จังหวัด"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.province || "-"}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">โทรศัพท์</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.phone || ""}
                onChange={(e) => updateAddress(index, "phone", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เบอร์โทรศัพท์"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.phone || "-"}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
            {isEditing ? (
              <input
                type="email"
                value={addr.email || ""}
                onChange={(e) => updateAddress(index, "email", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="อีเมล"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.email || "-"}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            {isEditing ? (
              <input
                type="url"
                value={addr.website || ""}
                onChange={(e) => updateAddress(index, "website", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เว็บไซต์"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.website || "-"}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ข้อมูลที่อยู่</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไขข้อมูลที่อยู่"
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

      {hasMultipleAddresses
        ? // Display all addresses with their types in the correct order
          (isEditing ? editData : application.addresses)
            .sort((a, b) => {
              // Sort by address type: 2 first, then 1, then 3
              const typeOrder = { 2: 1, 1: 2, 3: 3 };
              return (typeOrder[a.addressType] || 99) - (typeOrder[b.addressType] || 99);
            })
            .map((addr, index) => {
              const title = getAddressTitle(addr.addressType);
              return renderAddressCard(addr, title, index);
            })
        : // Display single address (fallback)
          renderAddressCard(
            isEditing ? editData[0] : application.address,
            "ที่อยู่จัดส่งเอกสาร"
          )}
    </div>
  );
};

export default AddressSectionEnhanced;
