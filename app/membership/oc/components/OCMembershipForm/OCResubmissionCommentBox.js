"use client";

import React from "react";

export default function OCResubmissionCommentBox({ value, onChange }) {
  const charCount = value?.length || 0;
  const maxChars = 500;

  return (
    <div className="mt-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header with icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <label
              htmlFor="user-resubmission-comment"
              className="block text-base font-semibold text-gray-800 mb-1"
            >
              ระบุรายละเอียดการแก้ไขข้อมูล
            </label>
            <p className="text-sm text-gray-600">
              กรุณาระบุรายละเอียดการแก้ไขข้อมูล ว่าท่านได้แก้ไขข้อมูลตรงส่วนใดบ้าง 
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id="user-resubmission-comment"
            className="block w-full rounded-lg border-2 border-gray-300 bg-white shadow-sm 
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                     text-sm min-h-[120px] p-4 resize-none
                     placeholder:text-gray-400
                     transition-all duration-200"
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder="ตัวอย่าง: แก้ไขที่อยู่บริษัท, เพิ่มเอกสารประกอบ, ปรับชื่อผู้มีอำนาจลงนาม"
            maxLength={maxChars}
          />
          
          {/* Character counter */}
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
            {charCount}/{maxChars}
          </div>
        </div>

      
         
   
      </div>
    </div>
  );
}