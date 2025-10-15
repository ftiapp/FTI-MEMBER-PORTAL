"use client";

import { useState, useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import { useFormIcons } from "./Icons";

/**
 * Products List Field Component
 * Reusable component for managing product/service list with add/remove functionality
 */
const ProductsListField = forwardRef(({ 
  formData, 
  setFormData, 
  errors,
  required = true,
  maxProducts = 10
}, ref) => {
  const { ErrorIcon, PlusIcon, DeleteIcon } = useFormIcons();

  const [products, setProducts] = useState(() => {
    const initialProducts =
      formData.products?.length > 0 ? formData.products : [{ nameTh: "", nameEn: "" }];
    return initialProducts.map((p, index) => ({
      ...p,
      key: p.key || `new-${index}-${Date.now()}`,
    }));
  });

  const handleProductChange = useCallback(
    (key, field, value) => {
      const updated = products.map((product) =>
        product.key === key ? { ...product, [field]: value } : product,
      );
      setProducts(updated);
      setFormData((prevForm) => ({ ...prevForm, products: updated }));
    },
    [products, setFormData],
  );

  const addProduct = useCallback(() => {
    if (products.length >= maxProducts) return;

    const newProduct = { key: `new-${Date.now()}`, nameTh: "", nameEn: "" };
    const updated = [...products, newProduct];
    setProducts(updated);
    setFormData((prevForm) => ({ ...prevForm, products: updated }));
  }, [products, maxProducts, setFormData]);

  const removeProduct = useCallback(
    (key) => {
      if (products.length <= 1) return;

      const updated = products.filter((product) => product.key !== key);
      setProducts(updated);
      setFormData((prevForm) => ({ ...prevForm, products: updated }));
    },
    [products, setFormData],
  );

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-900 mb-2">
          ผลิตภัณฑ์/บริการ
          {required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        <p className="text-sm text-gray-600">
          {required 
            ? "ระบุผลิตภัณฑ์หรือบริการของท่าน (อย่างน้อย 1 รายการ)"
            : "ระบุผลิตภัณฑ์หรือบริการของท่าน (ถ้ามี)"}
        </p>
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
                <label
                  htmlFor={`product-th-${product.key}`}
                  className="block text-sm font-medium text-gray-900"
                >
                  ชื่อผลิตภัณฑ์/บริการ (ภาษาไทย)
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  id={`product-th-${product.key}`}
                  value={product.nameTh || ""}
                  onChange={(e) => handleProductChange(product.key, "nameTh", e.target.value)}
                  placeholder="ระบุชื่อผลิตภัณฑ์/บริการ..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`product-en-${product.key}`}
                  className="block text-sm font-medium text-gray-900"
                >
                  ชื่อผลิตภัณฑ์/บริการ (ภาษาอังกฤษ)
                </label>
                <input
                  type="text"
                  id={`product-en-${product.key}`}
                  value={product.nameEn || ""}
                  onChange={(e) => handleProductChange(product.key, "nameEn", e.target.value)}
                  placeholder="Product/Service name..."
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length < maxProducts && (
        <div className="mt-6">
          <button
            type="button"
            onClick={addProduct}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            {PlusIcon}
            <span className="text-sm font-medium text-gray-600">
              เพิ่มผลิตภัณฑ์/บริการ ({products.length} / {maxProducts})
            </span>
          </button>
        </div>
      )}

      {errors.products && (
        <p className="text-sm text-red-600 flex items-center gap-2 mt-4">
          {ErrorIcon}
          {String(errors.products)}
        </p>
      )}
    </div>
  );
});

ProductsListField.displayName = "ProductsListField";

ProductsListField.propTypes = {
  formData: PropTypes.shape({
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
    products: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  required: PropTypes.bool,
  maxProducts: PropTypes.number,
};

export default ProductsListField;
