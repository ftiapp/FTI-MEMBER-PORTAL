'use client';

import { compareProducts, formatProductsToArray } from '../utils/formatters';

/**
 * Component for comparing old and new products
 * @param {Object} props - Component props
 * @param {string} props.oldProducts - Old products string
 * @param {string} props.newProducts - New products string
 * @returns {JSX.Element} - Product comparison component
 */
export default function ProductComparison({ oldProducts, newProducts }) {
  const comparison = compareProducts(oldProducts, newProducts);
  
  return (
    <div className="mt-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">การเปรียบเทียบข้อมูลสินค้า</h3>
        <p className="text-sm text-gray-500 mt-1">กรุณาทำการแก้ไขข้อมูลสินค้าในระบบ ERP ก่อนกดอนุมัติคำขอ</p>
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
