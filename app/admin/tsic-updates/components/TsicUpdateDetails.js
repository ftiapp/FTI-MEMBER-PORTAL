'use client';

import React, { useState } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function TsicUpdateDetails({ 
  request, 
  handleApprove, 
  setShowRejectModal,
  actionLoading
}) {
  const [expandedTsic, setExpandedTsic] = useState(null);
  
  // Parse TSIC data from JSON
  console.log('TsicUpdateDetails - TSIC data type:', typeof request.tsic_data);
  console.log('TsicUpdateDetails - TSIC data raw:', request.tsic_data);
  
  let tsicData = [];
  try {
    if (typeof request.tsic_data === 'string') {
      tsicData = JSON.parse(request.tsic_data);
    } else if (Array.isArray(request.tsic_data)) {
      tsicData = request.tsic_data;
    } else {
      console.error('Unexpected TSIC data format in details component');
    }
    console.log('TsicUpdateDetails - Parsed TSIC data:', tsicData);
  } catch (error) {
    console.error('Error parsing TSIC data in details component:', error);
    tsicData = [];
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Group TSIC codes by category
  let groupedTsicCodes = {};
  
  if (Array.isArray(tsicData) && tsicData.length > 0) {
    groupedTsicCodes = tsicData.reduce((acc, tsic) => {
      const categoryCode = tsic.category_code || 'unknown';
      
      if (!acc[categoryCode]) {
        acc[categoryCode] = {
          category_code: categoryCode,
          category_name: tsic.category_name || `หมวดหมู่ ${categoryCode}`,
          items: []
        };
      }
      
      acc[categoryCode].items.push(tsic);
      return acc;
    }, {});
  } else {
    console.log('No TSIC data to group');
  }
  
  console.log('Grouped TSIC codes:', groupedTsicCodes);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">รายละเอียดคำขอ</h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">รหัสสมาชิก</p>
            <p className="font-medium">{request.member_code}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">สถานะ</p>
            <p className="font-medium">
              {request.status === 'pending' && <span className="text-yellow-600">รอการอนุมัติ</span>}
              {request.status === 'approved' && <span className="text-green-600">อนุมัติแล้ว</span>}
              {request.status === 'rejected' && <span className="text-red-600">ปฏิเสธแล้ว</span>}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">วันที่ขอ</p>
            <p className="font-medium">{formatDate(request.request_date)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">วันที่ดำเนินการ</p>
            <p className="font-medium">{formatDate(request.processed_date)}</p>
          </div>
          
          {request.admin_id && (
            <div>
              <p className="text-sm text-gray-500">ผู้ดำเนินการ</p>
              <p className="font-medium">Admin ID: {request.admin_id}</p>
            </div>
          )}
          
          {request.admin_comment && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">ความเห็นผู้ดูแลระบบ</p>
              <p className="font-medium">{request.admin_comment}</p>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">TSIC Codes ที่ขอแก้ไข</h3>
          
          <div className="space-y-4">
            {Object.values(groupedTsicCodes).map((category, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                  <h4 className="font-medium">
                    {category.category_code} - {category.category_name}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {category.items.length} รายการ
                  </span>
                </div>
                
                <div className="p-3">
                  <ul className="space-y-2">
                    {category.items.map((tsic, idx) => (
                      <li key={idx} className="p-2 bg-gray-50 rounded border">
                        <div className="font-medium">
                          {tsic.tsic_code} - {tsic.tsic_description || tsic.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {request.status === 'pending' && (
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
              ปฏิเสธคำขอ
            </button>
            
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
              onClick={() => handleApprove(request.id)}
              disabled={actionLoading}
            >
              {actionLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
              อนุมัติคำขอ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
