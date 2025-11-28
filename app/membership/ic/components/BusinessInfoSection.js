"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import { BusinessTypesField, ProductsListField } from "../../components/business-fields";
import IndustrialGroupSection from "../../components/IndustrialGroupSection";

/**
 * BusinessInfoSection for IC (สามัญ-บุคคลธรรมดา) membership
 * Simplified version - Only Business Types, Industrial Groups/Provincial Chapters and Products
 */
export default function BusinessInfoSection({
  formData,
  setFormData,
  errors,
  businessTypes,
  industrialGroups = [],
  provincialChapters = [],
}) {
  // Refs for scrolling to error sections
  const businessTypesRef = useRef(null);
  const otherBusinessTypeDetailRef = useRef(null);
  const productsRef = useRef(null);
  const lastScrolledErrorRef = useRef(null);

  // Scroll to error fields when errors change (same as OC)
  useEffect(() => {
    // Check for per-item product errors (same as OC)
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
      { ref: productsRef, error: errors.products || hasProductItemErrors, name: "สินค้า/บริการ" },
    ];

    const firstErrorField = errorFields.find((field) => field.error && field.ref.current);

    if (firstErrorField) {
      // Use actual error message if it's a string, otherwise build field names list
      let errorMessage;

      if (typeof errors.products === "string") {
        // Use the actual validation message for products
        errorMessage = errors.products;
      } else if (typeof errors.businessTypes === "string") {
        errorMessage = errors.businessTypes;
      } else if (typeof errors.otherBusinessTypeDetail === "string") {
        errorMessage = errors.otherBusinessTypeDetail;
      } else if (hasProductItemErrors && firstErrorField.ref === productsRef) {
        // Per-item product errors
        errorMessage = "กรุณากรอกข้อมูลสินค้า/บริการ อย่างน้อย 1 รายการ";
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
          id: "ic-business-errors",
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
        <h2 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลธุรกิจ / Business Information
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          ประเภทธุรกิจและข้อมูลผลิตภัณฑ์/บริการ / Business type and product/service information
        </p>
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

        {/* Industrial Groups and Provincial Chapters */}
        <IndustrialGroupSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
        />

        {/* Products - IC only has Business Types and Products */}
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
  formData: PropTypes.shape({
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
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
    products: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  businessTypes: PropTypes.array,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array,
};
