'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

export default function BusinessInfoSection({ formData, setFormData, errors, showErrors = false }) {
  // Refs for scrolling to error fields
  const businessTypesRef = useRef(null);
  const otherBusinessTypeDetailRef = useRef(null);
  const productsRef = useRef(null);

  // Effect for scrolling to first error when showErrors is true
  useEffect(() => {
    if (showErrors) {
      // Define the order of fields to check
      const errorFields = [
        { ref: businessTypesRef, error: errors.businessTypes },
        { ref: otherBusinessTypeDetailRef, error: errors.otherBusinessTypeDetail },
        { ref: productsRef, error: errors.products }
      ];

      // Find the first field with an error
      const firstErrorField = errorFields.find(field => field.error && field.ref.current);
      
      if (firstErrorField) {
        // Scroll to the first error field
        firstErrorField.ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show toast notification
        toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้องครบถ้วน', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    }
  }, [showErrors, errors]);

  const BUSINESS_TYPES = useMemo(() => [
    { id: 'manufacturer', nameTh: 'ผู้ผลิต' },
    { id: 'distributor', nameTh: 'ผู้จัดจำหน่าย' },
    { id: 'importer', nameTh: 'ผู้นำเข้า' },
    { id: 'exporter', nameTh: 'ผู้ส่งออก' },
    { id: 'service', nameTh: 'ผู้ให้บริการ' },
    { id: 'other', nameTh: 'อื่นๆ' }
  ], []);

  const [products, setProducts] = useState(() => {
    const initialProducts = formData.products?.length > 0 ? formData.products : [{ nameTh: '', nameEn: '' }];
    return initialProducts.map((p, index) => ({
      ...p,
      key: p.key || `new-${index}-${Date.now()}`
    }));
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const updatedBusinessTypes = { ...prev.businessTypes };

      if (checked) {
        updatedBusinessTypes[name] = true;
      } else {
        delete updatedBusinessTypes[name];
      }

      return { ...prev, businessTypes: updatedBusinessTypes };
    });
  }, [setFormData]);

  const handleProductChange = useCallback((key, field, value) => {
    const updated = products.map(product =>
      product.key === key ? { ...product, [field]: value } : product
    );
    setProducts(updated);
    setFormData(prevForm => ({ ...prevForm, products: updated }));
  }, [products, setFormData]);

  const addProduct = useCallback(() => {
    if (products.length >= 10) return;

    const newProduct = { key: `new-${Date.now()}`, nameTh: '', nameEn: '' };
    const updated = [...products, newProduct];
    setProducts(updated);
    setFormData(prevForm => ({ ...prevForm, products: updated }));
  }, [products, setFormData]);

  const removeProduct = useCallback((key) => {
    if (products.length <= 1) return;

    const updated = products.filter(product => product.key !== key);
    setProducts(updated);
    setFormData(prevForm => ({ ...prevForm, products: updated }));
  }, [products, setFormData]);

  // Memoize error icon to prevent re-creation
  const ErrorIcon = useMemo(() => (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  const PlusIcon = useMemo(() => (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ), []);

  const DeleteIcon = useMemo(() => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ), []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10" data-section="business">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลธุรกิจ</h2>
        <p className="text-blue-100 text-sm mt-1">ประเภทธุรกิจและข้อมูลผลิตภัณฑ์/บริการ</p>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Business Types */}
        <div ref={businessTypesRef} className="bg-white border border-gray-200 rounded-lg p-6" id="businessTypes" data-field="businessTypes">
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              ประเภทธุรกิจ<span className="text-red-500 ml-1">*</span>
            </h3>
            <p className="text-sm text-gray-600">เลือกประเภทธุรกิจที่เกี่ยวข้อง (เลือกได้มากกว่า 1 ข้อ)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESS_TYPES.map(type => (
              <label key={type.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  name={type.id}
                  checked={formData.businessTypes?.[type.id] || false}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">{type.nameTh}</span>
              </label>
            ))}
          </div>

          {formData.businessTypes?.other && (
            <div ref={otherBusinessTypeDetailRef} className="mt-6 pt-6 border-t border-gray-100">
              <label htmlFor="otherBusinessTypeDetail" className="block text-sm font-medium text-gray-900 mb-2">
                โปรดระบุประเภทธุรกิจอื่นๆ<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="otherBusinessTypeDetail"
                name="otherBusinessTypeDetail"
                data-field="otherBusinessTypeDetail"
                value={formData.otherBusinessTypeDetail || ''}
                onChange={handleInputChange}
                placeholder="ระบุประเภทธุรกิจ..."
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.otherBusinessTypeDetail ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.otherBusinessTypeDetail && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  {ErrorIcon}
                  {String(errors.otherBusinessTypeDetail)}
                </p>
              )}
            </div>
          )}

          {errors.businessTypes && (
            <p className="text-sm text-red-600 flex items-center gap-2 mt-4">
              {ErrorIcon}
              {typeof errors.businessTypes === 'object' ? JSON.stringify(errors.businessTypes) : String(errors.businessTypes)}
            </p>
          )}
        </div>

        {/* Products */}
        <div ref={productsRef} className="bg-white border border-gray-200 rounded-lg p-6" id="products" data-field="products">
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-2">
              ผลิตภัณฑ์/บริการ<span className="text-red-500 ml-1">*</span>
            </h4>
            <p className="text-sm text-gray-600">ระบุผลิตภัณฑ์หรือบริการของท่าน (อย่างน้อย 1 รายการ)</p>
          </div>

          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.key} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">รายการที่ {index + 1}</span>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(product.key)}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                    >
                      {DeleteIcon}
                      ลบรายการ
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor={`product-th-${product.key}`} className="block text-sm font-medium text-gray-900">
                      ชื่อผลิตภัณฑ์/บริการ (ภาษาไทย)<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id={`product-th-${product.key}`}
                      value={product.nameTh || ''}
                      onChange={(e) => handleProductChange(product.key, 'nameTh', e.target.value)}
                      placeholder="ระบุชื่อผลิตภัณฑ์/บริการ..."
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`product-en-${product.key}`} className="block text-sm font-medium text-gray-900">
                      ชื่อผลิตภัณฑ์/บริการ (ภาษาอังกฤษ)
                    </label>
                    <input
                      type="text"
                      id={`product-en-${product.key}`}
                      value={product.nameEn || ''}
                      onChange={(e) => handleProductChange(product.key, 'nameEn', e.target.value)}
                      placeholder="Product/Service name..."
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length < 10 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                {PlusIcon}
                <span className="text-sm font-medium text-gray-600">
                  เพิ่มผลิตภัณฑ์/บริการ ({products.length}/10)
                </span>
              </button>
            </div>
          )}

          {errors.products && (
            <p className="text-sm text-red-600 flex items-center gap-2 mt-4">
              {ErrorIcon}
              {typeof errors.products === 'object' ? JSON.stringify(errors.products) : String(errors.products)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

BusinessInfoSection.propTypes = {
  showErrors: PropTypes.bool,
  formData: PropTypes.shape({
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
    products: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      id: PropTypes.number, // Keep id for existing data from DB
      nameTh: PropTypes.string,
      nameEn: PropTypes.string
    }))
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    businessTypes: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    otherBusinessTypeDetail: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    products: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
  }).isRequired
};