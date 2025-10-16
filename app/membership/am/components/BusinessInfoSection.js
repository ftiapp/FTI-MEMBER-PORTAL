"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import {
  BusinessTypesField,
  MemberCountField,
  EmployeeCountField,
  FinancialInfoFields,
  ProductsListField,
  useNumericInput,
} from "../../components/business-fields";

/**
 * BusinessInfoSection for AM (สมาคม) membership
 * Includes Member Count field
 */
export default function BusinessInfoSection({ formData, setFormData, errors, showErrors = false }) {
  // Use numeric input hook
  const numericHandlers = useNumericInput(formData, setFormData);
  
  // Refs for scrolling to error sections
  const businessTypesRef = useRef(null);
  const otherBusinessTypeDetailRef = useRef(null);
  const memberCountRef = useRef(null);
  const employeeCountRef = useRef(null);
  const productsRef = useRef(null);
  const lastScrolledErrorRef = useRef(null);

  // Scroll to error fields when showErrors is true
  useEffect(() => {
    if (showErrors) {
      const errorFields = [
        { ref: businessTypesRef, error: errors.businessTypes, name: 'ประเภทธุรกิจ' },
        { ref: otherBusinessTypeDetailRef, error: errors.otherBusinessTypeDetail, name: 'รายละเอียดประเภทธุรกิจอื่นๆ' },
        { ref: memberCountRef, error: errors.memberCount, name: 'จำนวนสมาชิกสมาคม' },
        { ref: employeeCountRef, error: errors.numberOfEmployees, name: 'จำนวนพนักงาน' },
        { ref: productsRef, error: errors.products, name: 'สินค้า/บริการ' },
      ];

      const firstErrorField = errorFields.find((field) => field.error && field.ref.current);

      if (firstErrorField) {
        const errorFieldNames = errorFields
          .filter(field => field.error)
          .map(field => field.name)
          .join(', ');

        const errorKey = errorFieldNames;
        
        if (errorKey !== lastScrolledErrorRef.current) {
          lastScrolledErrorRef.current = errorKey;
          firstErrorField.ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
          toast.error(`กรุณากรอก ${errorFieldNames} ให้ถูกต้องครบถ้วน`, { 
            id: "am-business-errors",
            duration: 5000 
          });
        }
      }
    } else {
      lastScrolledErrorRef.current = null;
    }
  }, [showErrors, errors]);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10"
      data-section="business-info"
    >
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลุรกิจ / Business Information</h2>
        <p className="text-blue-100 text-sm mt-1">ประเภทธุรกิจและข้อมูลผลิตภัณฑ์/บริการ / Business type and product/service information</p>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Business Types */}
        <BusinessTypesField
          ref={businessTypesRef}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          otherFieldRef={otherBusinessTypeDetailRef}
        />

        {/* Member Count - Specific to AM */}
        <MemberCountField
          ref={memberCountRef}
          formData={formData}
          errors={errors}
          handleNumericChange={numericHandlers.handleNumericChange}
          handleNumericFocus={numericHandlers.handleNumericFocus}
          handleNumericBlur={numericHandlers.handleNumericBlur}
        />

        {/* Employee Count */}
        <EmployeeCountField
          ref={employeeCountRef}
          formData={formData}
          errors={errors}
          handleNumericChange={numericHandlers.handleNumericChange}
          handleNumericFocus={numericHandlers.handleNumericFocus}
          handleNumericBlur={numericHandlers.handleNumericBlur}
        />

        {/* Financial Information */}
        <FinancialInfoFields
          formData={formData}
          setFormData={setFormData}
          handleNumericChange={numericHandlers.handleNumericChange}
          handlePercentageChange={numericHandlers.handlePercentageChange}
          handleNumericFocus={numericHandlers.handleNumericFocus}
          handleNumericBlur={numericHandlers.handleNumericBlur}
        />

        {/* Products */}
        <ProductsListField
          ref={productsRef}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          required={false}
          maxProducts={10}
        />
      </div>
    </div>
  );
}

BusinessInfoSection.propTypes = {
  showErrors: PropTypes.bool,
  formData: PropTypes.shape({
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
    memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    numberOfEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    registeredCapital: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    revenueLastYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    revenuePreviousYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productionCapacityValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productionCapacityUnit: PropTypes.string,
    salesDomestic: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salesExport: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shareholderThaiPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shareholderForeignPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    products: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        id: PropTypes.number,
        nameTh: PropTypes.string,
        nameEn: PropTypes.string,
      }),
    ),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    businessTypes: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    otherBusinessTypeDetail: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    numberOfEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    products: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
};
