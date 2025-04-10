'use client';

import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function VerificationStatusDisplay({ type, rejectReason }) {
  // Render different status displays based on the type
  if (type === 'loading') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
          <p className="text-blue-700">กำลังตรวจสอบสถานะการยืนยันตัวตน...</p>
        </div>
      </div>
    );
  }
  
  if (type === 'submitted') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaHourglassHalf className="text-blue-700 mr-3" />
          <div>
            <p className="text-blue-700 font-medium">กำลังรอการตรวจสอบ</p>
            <p className="text-sm text-blue-600">ข้อมูลของคุณอยู่ระหว่างการตรวจสอบโดยเจ้าหน้าที่ กรุณารอการติดต่อกลับภายใน 1-2 วันทำการ</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaCheckCircle className="text-green-600 mr-3" />
          <div>
            <p className="text-green-700 font-medium">ยืนยันตัวตนเรียบร้อยแล้ว</p>
            <p className="text-sm text-green-600">ข้อมูลของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถใช้งานระบบได้อย่างเต็มรูปแบบ</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FaTimesCircle className="text-red-600 mr-3 mt-1" />
          <div>
            <p className="text-red-700 font-medium">การยืนยันตัวตนไม่ผ่านการตรวจสอบ</p>
            <p className="text-sm text-red-600 mb-2">กรุณาแก้ไขข้อมูลและส่งเอกสารใหม่อีกครั้ง</p>
            {rejectReason && (
              <div className="bg-white p-3 rounded border border-red-100">
                <p className="text-sm font-medium text-gray-700">เหตุผลที่ไม่ผ่านการตรวจสอบ:</p>
                <p className="text-sm text-gray-600">{rejectReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Default case
  return null;
}