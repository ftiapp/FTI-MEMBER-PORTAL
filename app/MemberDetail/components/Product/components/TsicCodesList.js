'use client';

import React from 'react';
import { tsicStatusLabel } from './utils';

/**
 * Component for displaying existing TSIC codes
 */
const TsicCodesList = ({ tsicCodes, onEdit }) => {
  if (tsicCodes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        ยังไม่มีข้อมูล TSIC โค้ด<br />
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={onEdit}
        >
          เพิ่มข้อมูล
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-800">รายการ TSIC โค้ด</span>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          onClick={onEdit}
        >
          แก้ไข
        </button>
      </div>
      <ul className="pl-2 space-y-2">
        {tsicCodes.map((item, idx) => (
          <li key={idx} className="flex flex-col md:flex-row md:items-center md:space-x-2 border-b last:border-b-0 py-1">
            <span className="text-blue-700 font-semibold">{item.category_code} - {item.category_name}</span>
            <span className="text-gray-600">{item.tsic_code} : {item.description}</span>
            <span className={`ml-auto text-xs ${
              item.status === 'pending' ? 'text-yellow-500' : 
              item.status === 'approved' ? 'text-green-600' : 
              'text-red-500'
            }`}>
              {tsicStatusLabel(item.status)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TsicCodesList;