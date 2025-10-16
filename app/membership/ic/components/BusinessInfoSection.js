"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import {
  BusinessTypesField,
  ProductsListField,
} from "../../components/business-fields";

/**
 * BusinessInfoSection for IC (สามัญ-บุคคลธรรมดา) membership
 * Simplified version - Only Business Types and Products (no Employee Count, no Financial Info)
 */
export default function BusinessInfoSection({ formData, setFormData, errors, showErrors = false }) {
  // Refs for scrolling to error sections
  const businessTypesRef = useRef(null);
  const otherBusinessTypeDetailRef = useRef(null);
  const productsRef = useRef(null);
  const lastScrolledErrorRef = useRef(null);

  // Scroll to error fields when showErrors is true
  useEffect(() => {
    if (showErrors) {
      const errorFields = [
        { ref: businessTypesRef, error: errors.businessTypes, name: 'ประเภทธุรกิจ' },
        { ref: otherBusinessTypeDetailRef, error: errors.otherBusinessTypeDetail, name: 'รายละเอียดประเภทธุรกิจอื่นๆ' },
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
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: "ic-business-errors"
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
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลธุรกิจ / Business Information</h2>
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

        {/* Products - IC only has Business Types and Products */}
        <ProductsListField
          ref={productsRef}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          required={true}
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
};
