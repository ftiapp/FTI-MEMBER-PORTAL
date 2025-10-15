"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import {
  BusinessTypesField,
  MemberCountField,
  EmployeeCountField,
  FinancialInfoFields,
  ProductsListField,
  useNumericInput,
} from "./business-fields";

export default function BusinessInfoSection({ 
  formData, 
  setFormData, 
  errors, 
  showErrors = false,
  showMemberCount = false,
  businessTypes = null
}) {
  // Use numeric input hook
  const numericHandlers = useNumericInput(formData, setFormData);

  // Refs for scrolling to error fields
  const businessTypesRef = useRef(null);
  const otherBusinessTypeDetailRef = useRef(null);
  const memberCountRef = useRef(null);
  const employeeCountRef = useRef(null);
  const productsRef = useRef(null);
  const lastScrolledErrorRef = useRef(null);

  // Effect for scrolling to first error when showErrors is true
  useEffect(() => {
    if (showErrors) {
      // Define the order of fields to check
      const errorFields = [
        { ref: businessTypesRef, error: errors.businessTypes },
        { ref: otherBusinessTypeDetailRef, error: errors.otherBusinessTypeDetail },
        { ref: memberCountRef, error: errors.memberCount },
        { ref: employeeCountRef, error: errors.numberOfEmployees },
        { ref: productsRef, error: errors.products },
      ];

      // Find the first field with an error
      const firstErrorField = errorFields.find((field) => field.error && field.ref.current);

      if (firstErrorField) {
        // Create detailed error message
        const fieldMap = {
          businessTypes: 'ประเภทธุรกิจ',
          otherBusinessTypeDetail: 'รายละเอียดประเภทธุรกิจอื่นๆ',
          memberCount: 'จำนวนสมาชิก',
          numberOfEmployees: 'จำนวนพนักงาน',
          products: 'สินค้า/บริการ'
        };
        
        const errorFieldNames = errorFields
          .filter(field => field.error)
          .map(field => {
            const key = Object.keys(errors).find(k => errors[k] === field.error);
            return fieldMap[key] || key;
          })
          .join(', ');

        // Create a unique key for current errors to prevent duplicate scrolling
        const errorKey = errorFieldNames;
        
        // Only scroll if errors are different from the last scroll
        if (errorKey !== lastScrolledErrorRef.current) {
          lastScrolledErrorRef.current = errorKey;
          
          // Scroll to the first error field
          firstErrorField.ref.current.scrollIntoView({ behavior: "smooth", block: "center" });

          // Show toast notification with specific fields
          toast.error(`กรุณากรอก ${errorFieldNames} ให้ถูกต้องครบถ้วน`, { 
            id: "business-errors",
            duration: 5000 
          });
        }
      }
    } else {
      // Reset the scroll tracker when showErrors is false
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
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลธุรกิจ</h2>
        <p className="text-blue-100 text-sm mt-1">ประเภทธุรกิจและข้อมูลผลิตภัณฑ์/บริการ</p>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Business Types */}
        <BusinessTypesField
          ref={businessTypesRef}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          businessTypes={businessTypes}
          otherFieldRef={otherBusinessTypeDetailRef}
        />

        {/* Member Count - Only for AM membership type */}
        {showMemberCount && (
          <MemberCountField
            ref={memberCountRef}
            formData={formData}
            errors={errors}
            handleNumericChange={numericHandlers.handleNumericChange}
            handleNumericFocus={numericHandlers.handleNumericFocus}
            handleNumericBlur={numericHandlers.handleNumericBlur}
          />
        )}

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
  showMemberCount: PropTypes.bool,
  businessTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nameTh: PropTypes.string.isRequired,
    })
  ),
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
