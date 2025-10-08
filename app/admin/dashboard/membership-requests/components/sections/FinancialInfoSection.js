import React, { useState } from "react";
import { formatCurrency, formatNumber, formatPercent } from "../../ีutils/formatters";

const FinancialInfoSection = ({ application, type, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    registeredCapital: application?.registeredCapital || "",
    productionCapacityValue: application?.productionCapacityValue || "",
    productionCapacityUnit: application?.productionCapacityUnit || "",
    // Treat salesDomestic/salesExport as percentages (0-100)
    salesDomestic: application?.salesDomestic || "",
    salesExport: application?.salesExport || "",
    shareholderThaiPercent: application?.shareholderThaiPercent || "",
    shareholderForeignPercent: application?.shareholderForeignPercent || "",
    revenueLastYear: application?.revenueLastYear || "",
    revenuePreviousYear: application?.revenuePreviousYear || "",
  });

  if (type === "ic") return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      registeredCapital: application?.registeredCapital || "",
      productionCapacityValue: application?.productionCapacityValue || "",
      productionCapacityUnit: application?.productionCapacityUnit || "",
      salesDomestic: application?.salesDomestic || "",
      salesExport: application?.salesExport || "",
      shareholderThaiPercent: application?.shareholderThaiPercent || "",
      shareholderForeignPercent: application?.shareholderForeignPercent || "",
      revenueLastYear: application?.revenueLastYear || "",
      revenuePreviousYear: application?.revenuePreviousYear || "",
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate("financialInfo", editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating financial info:", error);
    }
  };

  // Keep salesDomestic and salesExport as a complementary percentage pair
  const handleSalesPercentChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newValue = Math.min(100, Math.max(0, numValue));
    if (field === "salesDomestic") {
      setEditData({
        ...editData,
        salesDomestic: newValue,
        salesExport: 100 - newValue,
      });
    } else {
      setEditData({
        ...editData,
        salesExport: newValue,
        salesDomestic: 100 - newValue,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleShareholderPercentChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newValue = Math.min(100, Math.max(0, numValue)); // Clamp between 0 and 100

    if (field === "shareholderThaiPercent") {
      setEditData({
        ...editData,
        shareholderThaiPercent: newValue,
        shareholderForeignPercent: 100 - newValue,
      });
    } else {
      setEditData({
        ...editData,
        shareholderForeignPercent: newValue,
        shareholderThaiPercent: 100 - newValue,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">ข้อมูลทางการเงิน</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไขข้อมูลทางการเงิน"
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
          <p className="text-sm font-semibold text-blue-700 mb-1">รายได้รวมก่อนหักค่าใช้จ่าย - ปีล่าสุด <span className="text-gray-500 text-xs">(ไม่บังคับกรอก)</span></p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.revenueLastYear}
                onChange={(e) => updateField("revenueLastYear", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="ml-2 text-gray-600">บาท</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.revenueLastYear
                ? `${formatCurrency(application.revenueLastYear)}`
                : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">รายได้รวมก่อนหักค่าใช้จ่าย - ปีก่อนหน้า <span className="text-gray-500 text-xs">(ไม่บังคับกรอก)</span></p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.revenuePreviousYear}
                onChange={(e) => updateField("revenuePreviousYear", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span className="ml-2 text-gray-600">บาท</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.revenuePreviousYear
                ? `${formatCurrency(application.revenuePreviousYear)}`
                : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ทุนจดทะเบียน</p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.registeredCapital}
                onChange={(e) => updateField("registeredCapital", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ทุนจดทะเบียน"
                min="0"
              />
              <span className="ml-2 text-gray-600">บาท</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.registeredCapital ? formatCurrency(application.registeredCapital) : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">กำลังการผลิต (ต่อปี)</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editData.productionCapacityValue}
                onChange={(e) => updateField("productionCapacityValue", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กำลังการผลิต"
                min="0"
              />
              <input
                type="text"
                value={editData.productionCapacityUnit}
                onChange={(e) => updateField("productionCapacityUnit", e.target.value)}
                className="w-32 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="หน่วย"
              />
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.productionCapacityValue && application.productionCapacityUnit
                ? `${formatNumber(application.productionCapacityValue)} ${application.productionCapacityUnit}`
                : application.productionCapacityValue
                  ? formatNumber(application.productionCapacityValue)
                  : application.productionCapacityUnit || "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายในประเทศ (%)</p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.salesDomestic}
                onChange={(e) => handleSalesPercentChange("salesDomestic", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max="100"
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.salesDomestic !== undefined && application.salesDomestic !== null && application.salesDomestic !== ""
                ? formatPercent(application.salesDomestic)
                : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ยอดจำหน่ายส่งออก (%)</p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.salesExport}
                onChange={(e) => handleSalesPercentChange("salesExport", e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max="100"
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.salesExport !== undefined && application.salesExport !== null && application.salesExport !== ""
                ? formatPercent(application.salesExport)
                : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นไทย</p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.shareholderThaiPercent}
                onChange={(e) =>
                  handleShareholderPercentChange("shareholderThaiPercent", e.target.value)
                }
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="สัดส่วนผู้ถือหุ้นไทย"
                min="0"
                max="100"
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.shareholderThaiPercent !== undefined &&
              application.shareholderThaiPercent !== null &&
              application.shareholderThaiPercent !== ""
                ? formatPercent(application.shareholderThaiPercent)
                : "-"}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">สัดส่วนผู้ถือหุ้นต่างประเทศ</p>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="number"
                value={editData.shareholderForeignPercent}
                onChange={(e) =>
                  handleShareholderPercentChange("shareholderForeignPercent", e.target.value)
                }
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="สัดส่วนผู้ถือหุ้นต่างประเทศ"
                min="0"
                max="100"
              />
              <span className="ml-2 text-gray-600">%</span>
            </div>
          ) : (
            <p className="text-lg text-gray-900">
              {application.shareholderForeignPercent !== undefined &&
              application.shareholderForeignPercent !== null &&
              application.shareholderForeignPercent !== ""
                ? formatPercent(application.shareholderForeignPercent)
                : "-"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
