'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const router = useRouter();
  const [operations, setOperations] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOperationStatus();
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchOperationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/operation-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations);
      } else {
        console.error('Failed to fetch operation status');
      }
    } catch (error) {
      console.error('Error fetching operation status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVerificationStatus = async () => {
    try {
      setVerificationLoading(true);
      const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      } else {
        console.error('Failed to fetch verification status');
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm น.', { locale: th });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" size={20} />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" size={20} />;
      default:
        return <FaHourglassHalf className="text-gray-500" size={20} />;
    }
  };
  
  const getVerificationStatusIcon = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return <FaHourglassHalf className="text-yellow-500" size={20} />;
      case 1:
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 2:
        return <FaTimesCircle className="text-red-500" size={20} />;
      default:
        return <FaInfoCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอการอนุมัติ';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธแล้ว';
      default:
        return 'รอดำเนินการ';
    }
  };
  
  const getVerificationStatusText = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return 'รอการตรวจสอบ';
      case 1:
        return 'อนุมัติแล้ว';
      case 2:
        return 'ปฏิเสธแล้ว';
      default:
        return 'ไม่ระบุสถานะ';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getVerificationStatusClass = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleEditVerification = (verification) => {
    // Redirect to the member verification page with the verification data
    router.push('/dashboard?tab=ยืนยันสมาชิกเดิม&edit=' + verification.id);
  };
  
  const handleDeleteSubmission = async (submissionId) => {
    if (!confirm('คุณต้องการลบคำขอยืนยันสมาชิกเดิมนี้หรือไม่?')) {
      return;
    }

    try {
      const verification = verifications.find(v => v.id === submissionId);
      const response = await fetch('/api/member/delete-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          userId: user.id,
          memberNumber: verification?.MEMBER_CODE || ''
        }),
      });

      if (response.ok) {
        // Refresh the verification list
        fetchVerificationStatus();
      } else {
        const data = await response.json();
        alert(data.message || 'เกิดข้อผิดพลาดในการลบคำขอ');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('เกิดข้อผิดพลาดในการลบคำขอ');
    }
  };

  if (loading || verificationLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Update Operations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">สถานะการแก้ไขข้อมูล</h3>
        
        {operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>ไม่พบรายการแก้ไขข้อมูล</p>
          </div>
        ) : (
        <div className="space-y-4">
          {operations.map((operation, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                  {getStatusIcon(operation.status)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{operation.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(operation.status)}`}>
                      {getStatusText(operation.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {operation.description}
                    {operation.status === 'rejected' && operation.reason && (
                      <span className="block mt-1 text-red-600">
                        เหตุผลที่ปฏิเสธ: {operation.reason}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(operation.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      
      {/* Member Verification Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">สถานะการยืนยันสมาชิกเดิม</h3>
        
        {verifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>ไม่พบรายการยืนยันสมาชิกเดิม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                    {getVerificationStatusIcon(verification.Admin_Submit)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{verification.company_name} ({verification.MEMBER_CODE})</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getVerificationStatusClass(verification.Admin_Submit)}`}>
                        {getVerificationStatusText(verification.Admin_Submit)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ประเภทบริษัท: {verification.company_type}
                      {verification.Admin_Submit === 2 && verification.reject_reason && (
                        <span className="block mt-1 text-red-600">
                          เหตุผลที่ปฏิเสธ: {verification.reject_reason}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {formatDate(verification.created_at)}
                      </span>
                      
                      <div className="flex space-x-2">
                        {verification.Admin_Submit === 2 && (
                          <button
                            onClick={() => handleDeleteSubmission(verification.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            ลบคำขอนี้
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEditVerification(verification)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          แก้ไขข้อมูล
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
