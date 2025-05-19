'use client';

import React, { useState } from 'react';
import { tsicStatusLabel } from './utils';
import { FaInfoCircle, FaEdit } from 'react-icons/fa';

/**
 * Component for displaying existing TSIC codes
 */
const TsicCodesList = ({ tsicCodes, onEdit }) => {
  const [expandedRequest, setExpandedRequest] = useState(null);
  
  // Group TSIC codes by request_id
  const groupedByRequest = tsicCodes.reduce((acc, code) => {
    const requestId = code.request_id || 'default';
    if (!acc[requestId]) {
      acc[requestId] = [];
    }
    acc[requestId].push(code);
    return acc;
  }, {});

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">รายการ TSIC โค้ด</h3>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition flex items-center gap-1"
          onClick={onEdit}
        >
          <FaEdit className="mr-1" /> แก้ไข
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(groupedByRequest).map(([requestId, codes]) => {
          if (codes.length === 0) return null;
          
          const firstCode = codes[0];
          const isExpanded = expandedRequest === requestId;
          const hasMultiple = codes.length > 1;
          const status = firstCode.status;
          
          return (
            <div key={requestId} className="border rounded-md overflow-hidden">
              <div 
                className={`p-3 cursor-pointer flex justify-between items-center ${
                  status === 'pending' ? 'bg-yellow-50' : 
                  status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                }`}
                onClick={() => setExpandedRequest(isExpanded ? null : requestId)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {hasMultiple ? `${codes.length} รายการ` : codes[0].description}
                      </span>
                      {hasMultiple && (
                        <span className="ml-2 text-sm text-gray-500">
                          (คลิกเพื่อดูรายละเอียด)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {tsicStatusLabel(status)}
                      </span>
                      <FaInfoCircle 
                        className={`ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {(isExpanded || !hasMultiple) && (
                <div className="p-3 bg-white border-t">
                  <ul className="space-y-2">
                    {codes.map((code, idx) => (
                      <li key={idx} className="py-1 border-b last:border-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-1 sm:mb-0">
                            <span className="font-medium text-gray-700">
                              {code.tsic_code}
                            </span>
                            <span className="text-gray-600 ml-2">
                              {code.description}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {code.category_name && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {code.category_name}
                              </span>
                            )}
                          </div>
                        </div>
                        {status === 'rejected' && code.admin_comment && (
                          <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>หมายเหตุจากผู้ดูแล:</strong> {code.admin_comment}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TsicCodesList;