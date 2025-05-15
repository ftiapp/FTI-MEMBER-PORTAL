'use client';

import React from 'react';
import { FaFileAlt, FaCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatProductsList } from './utils';

/**
 * Component for displaying products and services list
 */
const ProductsList = ({ companyInfo }) => {
  const productsList = formatProductsList(companyInfo.PRODUCT_DESC_TH);

  if (productsList.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        ยังไม่มีข้อมูลสินค้าและบริการ
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <h3 className="text-lg font-medium text-blue-600 border-b pb-2">
        สินค้าและบริการ
      </h3>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mt-4">
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
    </motion.div>
  );
};

export default ProductsList;
