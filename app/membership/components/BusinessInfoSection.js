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
  businessTypes = null,
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

  // Scroll to error fields when errors change (same as OC)
  useEffect(() => {
    const hasProductItemErrors = Array.isArray(errors.productErrors)
      ? errors.productErrors.some((e) => e && Object.keys(e).length > 0)
      : false;

    const errorFields = [
      { ref: businessTypesRef, error: errors.businessTypes, name: "ประเภทธุรกิจ" },
      {
        ref: otherBusinessTypeDetailRef,
        error: errors.otherBusinessTypeDetail,
        name: "รายละเอียดประเภทธุรกิจอื่นๆ",
      },
      { ref: memberCountRef, error: errors.memberCount, name: "จำนวนสมาชิก" },
      { ref: employeeCountRef, error: errors.numberOfEmployees, name: "จำนวนพนักงาน" },
      { ref: productsRef, error: errors.products || hasProductItemErrors, name: "สินค้า/บริการ" },
    ];

    const firstErrorField = errorFields.find((field) => field.error && field.ref.current);

    if (firstErrorField) {
      // Use actual error message if it's a string, otherwise build field names list
      let errorMessage;

      if (typeof errors.products === "string" && firstErrorField.ref === productsRef) {
        // Use the actual validation message for products
        errorMessage = errors.products;
      } else if (
        typeof errors.businessTypes === "string" &&
        firstErrorField.ref === businessTypesRef
      ) {
        errorMessage = errors.businessTypes;
      } else if (
        typeof errors.otherBusinessTypeDetail === "string" &&
        firstErrorField.ref === otherBusinessTypeDetailRef
      ) {
        errorMessage = errors.otherBusinessTypeDetail;
      } else {
        // Fallback: build field names list
        const errorFieldNames = errorFields
          .filter((field) => field.error)
          .map((field) => field.name)
          .join(", ");
        errorMessage = `กรุณากรอก ${errorFieldNames} ให้ถูกต้องครบถ้วน`;
      }

      const errorKey = errorMessage;

      if (errorKey !== lastScrolledErrorRef.current) {
        lastScrolledErrorRef.current = errorKey;
        firstErrorField.ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.error(errorMessage, {
          id: "business-errors",
          duration: 5000,
        });
      }
    } else {
      lastScrolledErrorRef.current = null;
    }
  }, [errors]);

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
          required={true}
          maxProducts={5}
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
    }),
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
