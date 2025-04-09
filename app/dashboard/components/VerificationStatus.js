'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

export default function VerificationStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    isLoading: true,
    submitted: false,
    approved: false,
    rejected: false,
    rejectReason: null,
    adminComment: null,
    error: null
  });

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user || !user.id) return;
      
      try {
        const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }
        
        const data = await response.json();
        setStatus({
          isLoading: false,
          submitted: data.submitted,
          approved: data.approved,
          rejected: data.rejected,
          rejectReason: data.rejectReason,
          adminComment: data.adminComment,
          error: null
        });
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    fetchVerificationStatus();
  }, [user]);

  if (status.isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
        <h3 className="text-lg font-medium text-red-800">เกิดข้อผิดพลาด</h3>
        <p className="mt-2 text-sm text-red-700">{status.error}</p>
      </div>
    );
  }

  if (!status.submitted) {
    return null; // Don't show anything if not submitted
  }

  if (status.approved) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl shadow-md p-6 border border-green-200">
          <div className="flex items-center">
            <FaCheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-green-800">การยืนยันตัวตนสมาชิกเดิมได้รับการอนุมัติแล้ว</h3>
          </div>
          <p className="mt-2 text-sm text-green-700">
            ขอบคุณที่ทำการยืนยันตัวตน ท่านสามารถใช้งานระบบได้เต็มรูปแบบแล้ว
          </p>
          {status.adminComment && (
            <div className="mt-3 p-3 bg-green-100 rounded-md">
              <p className="text-sm font-medium text-green-800">ความคิดเห็นจากผู้ดูแลระบบ:</p>
              <p className="text-sm text-green-700">{status.adminComment}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status.rejected) {
    return (
      <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
        <div className="flex items-center">
          <FaTimesCircle className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-800">การยืนยันตัวตนสมาชิกเดิมถูกปฏิเสธ</h3>
        </div>
        <div className="mt-3 p-3 bg-red-100 rounded-md">
          <p className="text-sm font-medium text-red-800">เหตุผลที่ปฏิเสธ:</p>
          <p className="text-sm text-red-700">{status.rejectReason || 'ไม่ระบุเหตุผล'}</p>
        </div>
        <p className="mt-4 text-sm text-red-700">
          หากมีข้อสงสัยเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่
        </p>
        <div className="mt-4">
          <a 
            href="/dashboard/verification"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ส่งข้อมูลเพื่อยืนยันตัวตนใหม่
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-200">
      <div className="flex items-center">
        <FaHourglassHalf className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-blue-800">การยืนยันตัวตนสมาชิกเดิมอยู่ระหว่างการตรวจสอบ</h3>
      </div>
      <p className="mt-2 text-sm text-blue-700">
        ขอบคุณที่ทำการยืนยันตัวตน เจ้าหน้าที่กำลังตรวจสอบข้อมูลของท่าน
        เมื่อการตรวจสอบเสร็จสิ้น ท่านจะได้รับการแจ้งเตือนทางอีเมล
      </p>
      <div className="mt-4 p-3 bg-blue-100 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> การตรวจสอบอาจใช้เวลา 1-2 วันทำการ หากมีข้อสงสัยเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่
        </p>
      </div>
    </div>
  );
}
