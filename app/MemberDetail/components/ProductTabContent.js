'use client';

import { FaFileAlt, FaCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Products tab content for the member detail page
 */
export default function ProductsTabContent({ companyInfo }) {
  // Function to convert comma-separated products into an array
  const formatProductsList = (productsString) => {
    if (!productsString) return [];
    return productsString.split(',').map(item => item.trim()).filter(item => item);
  };

  const productsList = formatProductsList(companyInfo.PRODUCT_DESC_TH);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-lg font-medium text-blue-600 border-b pb-2">
        สินค้าและบริการ
      </h3>
      
      {productsList.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-start mb-3">
            <FaFileAlt className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
            <p className="font-medium text-gray-800">รายละเอียดสินค้า/บริการ</p>
          </div>
          
          <ul className="pl-8 space-y-2">
            {productsList.map((product, index) => (
              <li key={index} className="flex items-start group">
                <FaCircle className="text-blue-500 mr-2 mt-1.5 text-xs flex-shrink-0" />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  {product}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          ไม่พบข้อมูลสินค้าและบริการ
        </div>
      )}
    </motion.div>
  );
}
