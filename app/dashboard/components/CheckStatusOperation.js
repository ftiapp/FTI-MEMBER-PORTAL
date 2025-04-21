'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf, 
  FaInfoCircle, 
  FaEdit, 
  FaTrashAlt,
  FaSpinner,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const router = useRouter();
  const [operations, setOperations] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentVerificationPage, setCurrentVerificationPage] = useState(1);
  const itemsPerPage = 3; // Changed to 3 items per page
  
  // Refs for preventing duplicate requests
  const isLoadingOperations = useRef(false);
  const isLoadingVerifications = useRef(false);

  useEffect(() => {
    if (user?.id) {
      fetchOperationStatus();
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchOperationStatus = async () => {
    // Prevent duplicate requests
    if (isLoadingOperations.current) return;
    
    try {
      isLoadingOperations.current = true;
      setLoading(true);
      setLoadingError(false);
      
      const response = await fetch(`/api/dashboard/operation-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      } else {
        console.error('Failed to fetch operation status');
        setLoadingError(true);
      }
    } catch (error) {
      console.error('Error fetching operation status:', error);
      setLoadingError(true);
    } finally {
      setLoading(false);
      // Add a small delay before allowing new requests
      setTimeout(() => {
        isLoadingOperations.current = false;
      }, 300);
    }
  };
  
  const fetchVerificationStatus = async () => {
    // Prevent duplicate requests
    if (isLoadingVerifications.current) return;
    
    try {
      isLoadingVerifications.current = true;
      setVerificationLoading(true);
      
      const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Verification status data:', data);
        
        // Check if data has verifications array
        if (data.verifications && Array.isArray(data.verifications)) {
          // Filter out verifications with Admin_Submit = 3 (deleted)
          const filteredVerifications = data.verifications.filter(v => v.Admin_Submit !== 3);
          setVerifications(filteredVerifications);
        } else if (data.submitted && data.memberData) {
          // If there's only a single verification in memberData format, convert it to array
          // Only if it's not deleted (Admin_Submit !== 3)
          if (data.memberData.Admin_Submit !== 3) {
            const singleVerification = {
              id: data.memberData.id || Date.now(),
              MEMBER_CODE: data.memberData.MEMBER_CODE || '',
              company_name: data.memberData.company_name || '',
              company_type: data.memberData.company_type || '',
              tax_id: data.memberData.tax_id || '',
              Admin_Submit: data.approved ? 1 : data.rejected ? 2 : 0,
              reject_reason: data.rejectReason || '',
              created_at: data.memberData.created_at || new Date().toISOString()
            };
            
            setVerifications([singleVerification]);
          } else {
            // It's a deleted verification, don't show it
            setVerifications([]);
          }
        } else {
          // No verifications found
          setVerifications([]);
        }
      } else {
        console.error('Failed to fetch verification status');
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setVerifications([]);
    } finally {
      setVerificationLoading(false);
      // Add a small delay before allowing new requests
      setTimeout(() => {
        isLoadingVerifications.current = false;
      }, 300);
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
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  const getVerificationStatusClass = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 1:
        return 'bg-green-100 text-green-800 border border-green-200';
      case 2:
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  const handleEditVerification = (verification) => {
    router.push(`/dashboard?tab=was-member&edit=${verification.id}`);
  };
  
  const handleDeleteSubmission = async (submissionId) => {
    // Check if delete is already in progress
    if (deleteLoading === submissionId) return;
    
    if (!confirm('คุณต้องการลบคำขอยืนยันสมาชิกเดิมนี้หรือไม่?')) {
      return;
    }

    try {
      setDeleteLoading(submissionId);
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
        // Show success message temporarily
        const updatedVerifications = verifications.map(v => 
          v.id === submissionId 
            ? { ...v, deleting: true } 
            : v
        );
        setVerifications(updatedVerifications);
        
        // Remove from UI after delay for smooth experience
        setTimeout(() => {
          fetchVerificationStatus();
        }, 500);
      } else {
        const data = await response.json();
        alert(data.message || 'เกิดข้อผิดพลาดในการลบคำขอ');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('เกิดข้อผิดพลาดในการลบคำขอ');
    } finally {
      // Clear delete loading state after a delay
      setTimeout(() => {
        setDeleteLoading(null);
      }, 500);
    }
  };
  
  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchOperationStatus();
      fetchVerificationStatus();
    }
  };
  
  // Calculate pagination for operations
  const indexOfLastOperation = currentPage * itemsPerPage;
  const indexOfFirstOperation = indexOfLastOperation - itemsPerPage;
  const currentOperations = operations.slice(indexOfFirstOperation, indexOfLastOperation);
  
  // Calculate pagination for verifications
  const indexOfLastVerification = currentVerificationPage * itemsPerPage;
  const indexOfFirstVerification = indexOfLastVerification - itemsPerPage;
  const currentVerifications = verifications.slice(indexOfFirstVerification, indexOfLastVerification);

  // Pagination component for operations
  const renderOperationPagination = () => {
    const totalPages = Math.ceil(operations.length / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
          aria-label="Previous page"
        >
          <FaChevronLeft size={16} />
        </button>
        
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            
            // Always show first, last, current, and pages around current
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              pageNumber === currentPage || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-md font-medium ${
                    currentPage === pageNumber 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  } transition-colors`}
                >
                  {pageNumber}
                </button>
              );
            }
            
            // Show ellipsis for gaps (only once per gap)
            if (
              (pageNumber === currentPage - 2 && pageNumber > 2) || 
              (pageNumber === currentPage + 2 && pageNumber < totalPages - 1)
            ) {
              return <span key={pageNumber} className="w-8 text-center">...</span>;
            }
            
            // Hide other page numbers
            return null;
          })}
        </div>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
          aria-label="Next page"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    );
  };
  
  // Pagination component for verifications
  const renderVerificationPagination = () => {
    const totalPages = Math.ceil(verifications.length / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={() => setCurrentVerificationPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentVerificationPage === 1}
          className={`p-2 rounded-md ${currentVerificationPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
          aria-label="Previous page"
        >
          <FaChevronLeft size={16} />
        </button>
        
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            
            // Always show first, last, current, and pages around current
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              pageNumber === currentVerificationPage || 
              (pageNumber >= currentVerificationPage - 1 && pageNumber <= currentVerificationPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentVerificationPage(pageNumber)}
                  className={`w-8 h-8 rounded-md font-medium ${
                    currentVerificationPage === pageNumber 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  } transition-colors`}
                >
                  {pageNumber}
                </button>
              );
            }
            
            // Show ellipsis for gaps (only once per gap)
            if (
              (pageNumber === currentVerificationPage - 2 && pageNumber > 2) || 
              (pageNumber === currentVerificationPage + 2 && pageNumber < totalPages - 1)
            ) {
              return <span key={pageNumber} className="w-8 text-center">...</span>;
            }
            
            // Hide other page numbers
            return null;
          })}
        </div>
        
        <button 
          onClick={() => setCurrentVerificationPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentVerificationPage === totalPages}
          className={`p-2 rounded-md ${currentVerificationPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
          aria-label="Next page"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    );
  };

  if (loading || verificationLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
          <FaSpinner className="animate-spin text-blue-600 mb-3" size={28} />
          <p className="font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  
  if (loadingError) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
          <FaExclamationCircle className="text-red-500 mb-3" size={28} />
          <p className="font-medium mb-3">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Update Operations */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" id="operations-container">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">สถานะการแก้ไขข้อมูล</h3>
        
        {operations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <FaInfoCircle className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-600 font-medium">ไม่พบรายการแก้ไขข้อมูล</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOperations.map((operation, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                    {getStatusIcon(operation.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h4 className="font-semibold text-gray-900">{operation.title}</h4>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(operation.status)} font-medium shadow-sm`}>
                        {getStatusText(operation.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      {operation.description}
                      {operation.status === 'rejected' && operation.reason && (
                        <span className="block mt-2 text-red-600 p-2 bg-red-50 rounded border border-red-200">
                          <strong>เหตุผลที่ปฏิเสธ:</strong> {operation.reason}
                        </span>
                      )}
                    </p>
                    <div className="mt-3 text-sm text-gray-600">
                      {formatDate(operation.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination for operations */}
            {renderOperationPagination()}
          </div>
        )}
      </div>
      
      {/* Member Verification Status */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" id="verifications-container">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">สถานะการยืนยันสมาชิกเดิม</h3>
        
        {verifications.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <FaInfoCircle className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-600 font-medium">ไม่พบรายการยืนยันสมาชิกเดิม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentVerifications.map((verification) => (
              <div 
                key={verification.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                  verification.deleting ? 'opacity-50 scale-95' : 'opacity-100'
                } ${verification.Admin_Submit === 2 ? 'bg-red-50 border-red-200' : 
                      verification.Admin_Submit === 1 ? 'bg-green-50 border-green-200' : 
                      'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-white rounded-lg p-3 text-center min-w-[60px] shadow-sm border border-gray-200">
                    {getVerificationStatusIcon(verification.Admin_Submit)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {verification.company_name} 
                        <span className="text-blue-700"> ({verification.MEMBER_CODE})</span>
                      </h4>
                      <span className={`px-3 py-1 text-xs rounded-full ${getVerificationStatusClass(verification.Admin_Submit)} font-medium shadow-sm`}>
                        {getVerificationStatusText(verification.Admin_Submit)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded-md">
                        ประเภทบริษัท: <strong>{verification.company_type}</strong>
                      </span>
                      {verification.Admin_Submit === 2 && verification.reject_reason && (
                        <span className="block mt-2 text-red-600 p-2 bg-red-50 rounded border border-red-200">
                          <strong>เหตุผลที่ปฏิเสธ:</strong> {verification.reject_reason}
                        </span>
                      )}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-sm text-gray-600">
                        วันที่ส่งคำขอ: <strong>{formatDate(verification.created_at)}</strong>
                      </span>
                      
                      <div className="flex space-x-2">
                        {/* Edit button with improved styling */}
                        <button
                          onClick={() => handleEditVerification(verification)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium flex items-center shadow-sm hover:shadow active:translate-y-0.5"
                        >
                          <FaEdit className="h-4 w-4 mr-1.5" />
                          แก้ไขข้อมูล
                        </button>
                        
                        {/* Delete button only for rejected submissions */}
                        {verification.Admin_Submit === 2 && (
                          <button
                            onClick={() => handleDeleteSubmission(verification.id)}
                            disabled={deleteLoading === verification.id}
                            className={`px-3 py-2 ${deleteLoading === verification.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md transition-all text-sm font-medium flex items-center shadow-sm hover:shadow active:translate-y-0.5 min-w-[100px] justify-center`}
                          >
                            {deleteLoading === verification.id ? (
                              <span className="flex items-center">
                                <FaHourglassHalf className="h-4 w-4 mr-1.5 animate-spin" />
                                กำลังลบ...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <FaTrashAlt className="h-4 w-4 mr-1.5" />
                                ลบข้อมูล
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination for verifications */}
            {renderVerificationPagination()}
          </div>
        )}
      </div>
      
      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Better button active state */
        button:active {
          transform: translateY(2px);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}