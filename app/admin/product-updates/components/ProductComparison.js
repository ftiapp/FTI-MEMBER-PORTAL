"use client";

import React from "react";
import { AlertTriangle, PlusCircle, MinusCircle, List } from "lucide-react";

// Utility functions for product comparison
const compareProducts = (oldProducts, newProducts) => {
  const oldSet = new Set(formatProductsToArray(oldProducts));
  const newSet = new Set(formatProductsToArray(newProducts));

  const added = formatProductsToArray(newProducts).filter((product) => !oldSet.has(product));
  const removed = formatProductsToArray(oldProducts).filter((product) => !newSet.has(product));

  return { added, removed };
};

const formatProductsToArray = (products) => {
  if (!products) return [];
  if (Array.isArray(products)) return products;
  if (typeof products === "string") return products.split(",").map((p) => p.trim());
  return [];
};

/**
 * Component for comparing old and new product lists in both Thai and English
 * @param {Object} props
 * @param {Array} props.oldProductsTH - Array of old Thai products
 * @param {Array} props.newProductsTH - Array of new Thai products
 * @param {Array} props.oldProductsEN - Array of old English products
 * @param {Array} props.newProductsEN - Array of new English products
 * @returns {JSX.Element}
 */
export default function ProductComparison({
  oldProductsTH = [],
  newProductsTH = [],
  oldProductsEN = [],
  newProductsEN = [],
}) {
  const comparisonTH = compareProducts(oldProductsTH, newProductsTH);
  const comparisonEN = compareProducts(oldProductsEN, newProductsEN);

  return (
    <div className="mt-8">
      <h3 className="font-medium mb-5 text-lg text-gray-800 flex items-center gap-2">
        <List className="text-blue-600 h-5 w-5" /> รายการสินค้าที่มีการเปลี่ยนแปลง (Product Changes)
      </h3>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-6 rounded-r-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-medium">
              กรุณาแก้ไขข้อมูลสินค้าในระบบ ERP ก่อนที่จะอนุมัติคำขอแก้ไขนี้
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Thai Products */}
        <div>
          <h4 className="font-medium mb-3 text-gray-800 border-b pb-2">สินค้า/บริการ (ภาษาไทย)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Old Thai Products */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <h5 className="font-medium mb-3 text-gray-700">สินค้าเดิม</h5>
              {oldProductsTH && oldProductsTH.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {formatProductsToArray(oldProductsTH).map((product, index) => (
                    <li key={index} className="text-gray-600">
                      {product}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">ไม่มีข้อมูลสินค้าเดิม</p>
              )}
            </div>

            {/* New Thai Products */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <h5 className="font-medium mb-3 text-gray-700">สินค้าใหม่</h5>
              {newProductsTH && newProductsTH.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {formatProductsToArray(newProductsTH).map((product, index) => (
                    <li key={index} className="text-gray-600">
                      {product}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">ไม่มีข้อมูลสินค้าใหม่</p>
              )}
            </div>
          </div>
        </div>

        {/* English Products */}
        <div>
          <h4 className="font-medium mb-3 text-gray-800 border-b pb-2">
            Products/Services (English)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Old English Products */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <h5 className="font-medium mb-3 text-gray-700">Old Products</h5>
              {oldProductsEN && oldProductsEN.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {formatProductsToArray(oldProductsEN).map((product, index) => (
                    <li key={index} className="text-gray-600">
                      {product}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No previous product data</p>
              )}
            </div>

            {/* New English Products */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <h5 className="font-medium mb-3 text-gray-700">New Products</h5>
              {newProductsEN && newProductsEN.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {formatProductsToArray(newProductsEN).map((product, index) => (
                    <li key={index} className="text-gray-600">
                      {product}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No new product data</p>
              )}
            </div>
          </div>
        </div>

        {/* Thai Changes */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">การเปลี่ยนแปลง (ภาษาไทย)</h4>

          {/* Added Thai Products */}
          {comparisonTH.added.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-green-700 mb-2 flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" /> เพิ่มสินค้าใหม่
              </h5>
              <ul className="list-disc pl-8 space-y-1">
                {comparisonTH.added.map((product, index) => (
                  <li key={index} className="text-green-600">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Removed Thai Products */}
          {comparisonTH.removed.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700 mb-2 flex items-center">
                <MinusCircle className="h-4 w-4 mr-2" /> ลบสินค้าออก
              </h5>
              <ul className="list-disc pl-8 space-y-1">
                {comparisonTH.removed.map((product, index) => (
                  <li key={index} className="text-red-600">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comparisonTH.added.length === 0 && comparisonTH.removed.length === 0 && (
            <p className="text-gray-500 italic">ไม่มีการเปลี่ยนแปลงรายการสินค้าภาษาไทย</p>
          )}
        </div>

        {/* English Changes */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">Changes (English)</h4>

          {/* Added English Products */}
          {comparisonEN.added.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-green-700 mb-2 flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" /> Added Products
              </h5>
              <ul className="list-disc pl-8 space-y-1">
                {comparisonEN.added.map((product, index) => (
                  <li key={index} className="text-green-600">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Removed English Products */}
          {comparisonEN.removed.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700 mb-2 flex items-center">
                <MinusCircle className="h-4 w-4 mr-2" /> Removed Products
              </h5>
              <ul className="list-disc pl-8 space-y-1">
                {comparisonEN.removed.map((product, index) => (
                  <li key={index} className="text-red-600">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comparisonEN.added.length === 0 && comparisonEN.removed.length === 0 && (
            <p className="text-gray-500 italic">No changes in English product listings</p>
          )}
        </div>
      </div>
    </div>
  );
}
