import React, { useState, useEffect } from "react";
import { getFactoryTypeName } from "../../ีutils/dataTransformers";

const CompanyInfoSection = ({ application, type, onUpdate }) => {
  const isIC = type === "ic";
  
  const [isEditing, setIsEditing] = useState(false);
  
  const getInitialData = () => ({
    // For IC: use first_name/last_name fields
    companyNameTh: isIC 
      ? `${application?.first_name_th || application?.firstNameTh || ""} ${application?.last_name_th || application?.lastNameTh || ""}`.trim()
      : application?.companyNameTh || "",
    companyNameEn: isIC
      ? `${application?.first_name_en || application?.firstNameEn || ""} ${application?.last_name_en || application?.lastNameEn || ""}`.trim()
      : application?.companyNameEn || "",
    taxId: isIC 
      ? application?.id_card_number || application?.idCard || ""
      : application?.taxId || "",
    numberOfEmployees: application?.numberOfEmployees || "",
    numberOfMembers: application?.numberOfMembers || "",
    factoryType: application?.factoryType || "",
    email: application?.email || "",
    phone: application?.phone || "",
    website: application?.website || "",
  });

  const [editData, setEditData] = useState(getInitialData());

  // Sync state when application prop changes (after successful update)
  useEffect(() => {
    if (!isEditing && application) {
      setEditData({
        companyNameTh: isIC 
          ? `${application?.first_name_th || application?.firstNameTh || ""} ${application?.last_name_th || application?.lastNameTh || ""}`.trim()
          : application?.companyNameTh || "",
        companyNameEn: isIC
          ? `${application?.first_name_en || application?.firstNameEn || ""} ${application?.last_name_en || application?.lastNameEn || ""}`.trim()
          : application?.companyNameEn || "",
        taxId: isIC 
          ? application?.id_card_number || application?.idCard || ""
          : application?.taxId || "",
        numberOfEmployees: application?.numberOfEmployees || "",
        numberOfMembers: application?.numberOfMembers || "",
        factoryType: application?.factoryType || "",
        email: application?.email || "",
        phone: application?.phone || "",
        website: application?.website || "",
      });
    }
  }, [application, isEditing, isIC]);

  if (!application) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      companyNameTh: isIC 
        ? `${application?.first_name_th || application?.firstNameTh || ""} ${application?.last_name_th || application?.lastNameTh || ""}`.trim()
        : application?.companyNameTh || "",
      companyNameEn: isIC
        ? `${application?.first_name_en || application?.firstNameEn || ""} ${application?.last_name_en || application?.lastNameEn || ""}`.trim()
        : application?.companyNameEn || "",
      taxId: isIC 
        ? application?.id_card_number || application?.idCard || ""
        : application?.taxId || "",
      numberOfEmployees: application?.numberOfEmployees || "",
      numberOfMembers: application?.numberOfMembers || "",
      factoryType: application?.factoryType || "",
      email: application?.email || "",
      phone: application?.phone || "",
      website: application?.website || "",
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate("companyInfo", editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating company info:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      companyNameTh: isIC 
        ? `${application?.first_name_th || application?.firstNameTh || ""} ${application?.last_name_th || application?.lastNameTh || ""}`.trim()
        : application?.companyNameTh || "",
      companyNameEn: isIC
        ? `${application?.first_name_en || application?.firstNameEn || ""} ${application?.last_name_en || application?.lastNameEn || ""}`.trim()
        : application?.companyNameEn || "",
      taxId: isIC 
        ? application?.id_card_number || application?.idCard || ""
        : application?.taxId || "",
      numberOfEmployees: application?.numberOfEmployees || "",
      numberOfMembers: application?.numberOfMembers || "",
      factoryType: application?.factoryType || "",
      email: application?.email || "",
      phone: application?.phone || "",
      website: application?.website || "",
    });
  };

  const updateField = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">{isIC ? "ข้อมูลบุคคล" : "ข้อมูลบริษัท/องค์กร"}</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title={isIC ? "แก้ไขข้อมูลบุคคล" : "แก้ไขข้อมูลบริษัท/องค์กร"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">{isIC ? "ชื่อ-นามสกุล (ไทย)" : "ชื่อ (ไทย)"}</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.companyNameTh}
              onChange={(e) => updateField("companyNameTh", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isIC ? "ชื่อ-นามสกุล (ไทย)" : "ชื่อบริษัท (ไทย)"}
            />
          ) : (
            <p className="text-lg text-gray-900">{isIC ? `${application?.first_name_th || application?.firstNameTh || ""} ${application?.last_name_th || application?.lastNameTh || ""}`.trim() || "-" : application.companyNameTh || "-"}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">{isIC ? "ชื่อ-นามสกุล (อังกฤษ)" : "ชื่อ (อังกฤษ)"}</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.companyNameEn}
              onChange={(e) => updateField("companyNameEn", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isIC ? "ชื่อ-นามสกุล (อังกฤษ)" : "ชื่อบริษัท (อังกฤษ)"}
            />
          ) : (
            <p className="text-lg text-gray-900">{isIC ? `${application?.first_name_en || application?.firstNameEn || ""} ${application?.last_name_en || application?.lastNameEn || ""}`.trim() || "-" : application.companyNameEn || "-"}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">{isIC ? "เลขประจำตัวประชาชน" : "เลขทะเบียนนิติบุคคล"}</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.taxId}
              onChange={(e) => updateField("taxId", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isIC ? "เลขประจำตัวประชาชน" : "เลขทะเบียนนิติบุคคล"}
              maxLength="13"
            />
          ) : (
            <p className="text-lg text-gray-900 font-mono">{isIC ? application?.id_card_number || application?.idCard || "-" : application.taxId || "-"}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนพนักงาน</p>
          {isEditing ? (
            <input
              type="number"
              value={editData.numberOfEmployees}
              onChange={(e) => updateField("numberOfEmployees", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="จำนวนพนักงาน"
            />
          ) : (
            <p className="text-lg text-gray-900">
              {application.numberOfEmployees ? `${application.numberOfEmployees} คน` : "-"}
            </p>
          )}
        </div>

        {type === "am" && (application.numberOfMembers || isEditing) && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">จำนวนสมาชิกสมาคม</p>
            {isEditing ? (
              <input
                type="number"
                value={editData.numberOfMembers}
                onChange={(e) => updateField("numberOfMembers", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="จำนวนสมาชิกสมาคม"
              />
            ) : (
              <p className="text-lg text-gray-900">{application.numberOfMembers} คน</p>
            )}
          </div>
        )}

        {type === "oc" && (application.factoryType || isEditing) && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทโรงงาน</p>
            {isEditing ? (
              <select
                value={editData.factoryType}
                onChange={(e) => updateField("factoryType", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกประเภทโรงงาน</option>
                <option value="type1">ประเภทที่ 1: มีเครื่องจักร มากกว่า 50 แรงม้า</option>
                <option value="type2">
                  ประเภทที่ 2: ไม่มีเครื่องจักร/มีเครื่องจักร ต่ำกว่า 50 แรงม้า
                </option>
              </select>
            ) : (
              <p className="text-lg text-gray-900">{getFactoryTypeName(application.factoryType)}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อีเมล"
            />
          ) : (
            <p className="text-lg text-gray-900">{application.email || "-"}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เบอร์โทรศัพท์"
            />
          ) : (
            <p className="text-lg text-gray-900">{application.phone || "-"}</p>
          )}
        </div>
        {(application.website || isEditing) && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.website}
                onChange={(e) => updateField("website", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เว็บไซต์"
              />
            ) : (
              <p className="text-lg text-gray-900">{application.website}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
