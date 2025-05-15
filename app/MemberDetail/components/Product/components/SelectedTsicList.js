'use client';

import React, { useMemo } from 'react';
import { FaTimes, FaCheck, FaFolder } from 'react-icons/fa';
import { tsicStatusLabel } from './utils';

/**
 * Component to display selected TSIC codes grouped by category
 */
const SelectedTsicList = ({ selectedTsicCodes, onRemove }) => {
  if (selectedTsicCodes.length === 0) {
    return null;
  }

  // Group TSIC codes by category
  const groupedTsicCodes = useMemo(() => {
    const grouped = {};
    
    selectedTsicCodes.forEach((tsic, index) => {
      const categoryCode = tsic.category_code || 'unknown';
      const categoryName = tsic.category_name || `หมวดหมู่ ${categoryCode}`;
      
      if (!grouped[categoryCode]) {
        grouped[categoryCode] = {
          name: categoryName,
          code: categoryCode,
          items: []
        };
      }
      
      grouped[categoryCode].items.push({
        ...tsic,
        originalIndex: index // Keep track of original index for removal
      });
    });
    
    return Object.values(grouped);
  }, [selectedTsicCodes]);

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">TSIC โค้ดที่เลือก</h4>
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        {groupedTsicCodes.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-4 last:mb-0">
            <div className="flex items-center bg-blue-50 p-2 rounded-t border border-blue-200">
              <FaFolder className="text-blue-500 mr-2" />
              <h5 className="font-medium text-blue-700">
                {category.code} - {category.name} 
                <span className="text-sm font-normal text-blue-600 ml-2">
                  ({category.items.length} รายการ)
                </span>
              </h5>
            </div>
            
            <ul className="border-x border-b border-gray-200 rounded-b">
              {category.items.map((tsic, index) => (
                <li key={index} className="flex items-center justify-between bg-white p-2 border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{tsic.tsic_code}</span> - {tsic.tsic_description || tsic.description}
                    {tsic.status && (
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${tsic.status === 'approved' ? 'bg-green-100 text-green-800' : tsic.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {tsicStatusLabel(tsic.status)}
                      </span>
                    )}
                  </div>
                  {onRemove && !tsic.status && (
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onRemove(tsic.originalIndex)}
                      title="ลบรายการนี้"
                    >
                      <FaTimes />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedTsicList;