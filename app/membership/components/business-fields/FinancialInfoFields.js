"use client";

import { useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Financial Information Fields Component
 * Reusable component for financial data inputs (capital, revenue, production, sales, shareholders)
 */
export default function FinancialInfoFields({ 
  formData, 
  setFormData,
  handleNumericChange,
  handlePercentageChange,
  handleNumericFocus,
  handleNumericBlur
}) {
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData],
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
        ข้อมูลทางการเงิน <span className="text-gray-500 text-xs">(ไม่บังคับกรอก)</span>
      </h4>

      {/* Registered Capital */}
      <div className="space-y-2 mb-6">
        <label htmlFor="registeredCapital" className="block text-sm font-medium text-gray-900">
          ทุนจดทะเบียน (บาท) <span className="text-gray-500 text-xs">(ไม่บังคับกรอก)</span>
        </label>
        <input
          type="text"
          id="registeredCapital"
          name="registeredCapital"
          value={formData.registeredCapital || ""}
          onChange={handleNumericChange}
          onFocus={handleNumericFocus}
          onBlur={handleNumericBlur}
          placeholder="0.00"
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
        />
      </div>

      {/* Revenue (Optional) */}
      <div className="space-y-2 mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          รายได้รวมก่อนหักค่าใช้จ่าย (ย้อนหลัง 2 ปี){" "}
          <span className="text-gray-500 text-xs">(ไม่บังคับกรอก)</span>
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="revenueLastYear"
              className="block text-sm font-medium text-gray-700"
            >
              ปีล่าสุด (บาท)
            </label>
            <input
              type="text"
              id="revenueLastYear"
              name="revenueLastYear"
              value={formData.revenueLastYear || ""}
              onChange={handleNumericChange}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="revenuePreviousYear"
              className="block text-sm font-medium text-gray-700"
            >
              ปีก่อนหน้า (บาท)
            </label>
            <input
              type="text"
              id="revenuePreviousYear"
              name="revenuePreviousYear"
              value={formData.revenuePreviousYear || ""}
              onChange={handleNumericChange}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Production Capacity */}
      <div className="space-y-2 mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          กำลังการผลิต (ต่อปี)
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="productionCapacityValue"
              className="block text-sm font-medium text-gray-700"
            >
              ปริมาณ
            </label>
            <input
              type="text"
              id="productionCapacityValue"
              name="productionCapacityValue"
              value={formData.productionCapacityValue || ""}
              onChange={handleNumericChange}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="productionCapacityUnit"
              className="block text-sm font-medium text-gray-700"
            >
              หน่วย
            </label>
            <input
              type="text"
              id="productionCapacityUnit"
              name="productionCapacityUnit"
              value={formData.productionCapacityUnit || ""}
              onChange={handleInputChange}
              placeholder="เช่น ตัน, ชิ้น, ลิตร"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Sales Information */}
      <div className="space-y-2 mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">ยอดจำหน่าย (%)</label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="salesDomestic" className="block text-sm font-medium text-gray-700">
              ในประเทศไทย
            </label>
            <input
              type="text"
              id="salesDomestic"
              name="salesDomestic"
              value={formData.salesDomestic || ""}
              onChange={(e) => handlePercentageChange(e, "salesExport")}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="salesExport" className="block text-sm font-medium text-gray-700">
              ส่งออก
            </label>
            <input
              type="text"
              id="salesExport"
              name="salesExport"
              value={formData.salesExport || ""}
              onChange={(e) => handlePercentageChange(e, "salesDomestic")}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Shareholder Information */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          สัดส่วนผู้ถือหุ้น (%)
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="shareholderThaiPercent"
              className="block text-sm font-medium text-gray-700"
            >
              ผู้ถือหุ้นไทย
            </label>
            <input
              type="text"
              id="shareholderThaiPercent"
              name="shareholderThaiPercent"
              value={formData.shareholderThaiPercent || ""}
              onChange={(e) => handlePercentageChange(e, "shareholderForeignPercent")}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="shareholderForeignPercent"
              className="block text-sm font-medium text-gray-700"
            >
              ผู้ถือหุ้นต่างประเทศ
            </label>
            <input
              type="text"
              id="shareholderForeignPercent"
              name="shareholderForeignPercent"
              value={formData.shareholderForeignPercent || ""}
              onChange={(e) => handlePercentageChange(e, "shareholderThaiPercent")}
              onFocus={handleNumericFocus}
              onBlur={handleNumericBlur}
              placeholder="0.00"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          หมายเหตุ: ผลรวมของสัดส่วนผู้ถือหุ้นไทยและต่างประเทศควรเท่ากับ 100%
        </p>
      </div>
    </div>
  );
}

FinancialInfoFields.propTypes = {
  formData: PropTypes.shape({
    registeredCapital: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    revenueLastYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    revenuePreviousYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productionCapacityValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productionCapacityUnit: PropTypes.string,
    salesDomestic: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salesExport: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shareholderThaiPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shareholderForeignPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNumericChange: PropTypes.func.isRequired,
  handlePercentageChange: PropTypes.func.isRequired,
  handleNumericFocus: PropTypes.func.isRequired,
  handleNumericBlur: PropTypes.func.isRequired,
};
