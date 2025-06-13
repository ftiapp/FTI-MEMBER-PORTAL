'use client';

import React from 'react';
import { AlertTriangle, PlusCircle, MinusCircle, List } from 'lucide-react';

// Mock utility functions - replace with actual implementations
const compareProducts = (oldProducts, newProducts) => {
  const oldSet = new Set(formatProductsToArray(oldProducts));
  const newSet = new Set(formatProductsToArray(newProducts));
  
  const added = formatProductsToArray(newProducts).filter(product => !oldSet.has(product));
  const removed = formatProductsToArray(oldProducts).filter(product => !newSet.has(product));
  
  return { added, removed };
};

const formatProductsToArray = (products) => {
  if (!products) return [];
  if (Array.isArray(products)) return products;
  if (typeof products === 'string') return products.split(',').map(p => p.trim());
  return [];
};

/**
 * Component for comparing old and new product lists
 * @param {Object} props
 * @param {Array} props.oldProducts - Array of old products
 * @param {Array} props.newProducts - Array of new products
 * @returns {JSX.Element}
 */
export default function ProductComparison({ oldProducts = [], newProducts = [] }) {
  const comparison = compareProducts(oldProducts, newProducts);
  
  return (
    <div className="mt-8">
      <h3 className="font-medium mb-5 text-lg text-gray-800 flex items-center gap-2">
        <List className="text-blue-600 h-5 w-5" /> รายการสินค้าที่มีการเปลี่ยนแปลง
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-2 text-gray-700">ข้อมูลเดิม</h4>
          <ul className="list-disc list-inside space-y-1">
            {formatProductsToArray(oldProducts).length > 0 ? (
              formatProductsToArray(oldProducts).map((product, index) => (
                <li key={index} className="text-gray-800">
                  {product}
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">ไม่มีข้อมูลสินค้า</li>
            )}
          </ul>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-2 text-gray-700">ข้อมูลใหม่</h4>
          <ul className="list-disc list-inside space-y-1">
            {formatProductsToArray(newProducts).length > 0 ? (
              formatProductsToArray(newProducts).map((product, index) => {
                const isAdded = comparison.added.includes(product);
                return (
                  <li 
                    key={index} 
                    className={`${isAdded ? 'text-green-600 font-medium' : 'text-gray-800'}`}
                  >
                    {product} {isAdded && <span className="text-xs">(เพิ่มใหม่)</span>}
                  </li>
                );
              })
            ) : (
              <li className="text-gray-500 italic">ไม่มีข้อมูลสินค้า</li>
            )}
          </ul>
          
          {comparison.removed.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-red-600 mb-1">รายการที่ถูกลบ:</h5>
              <ul className="list-disc list-inside space-y-1">
                {comparison.removed.map((product, index) => (
                  <li key={index} className="text-red-600 line-through">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}