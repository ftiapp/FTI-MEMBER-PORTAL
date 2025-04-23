'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingState from './components/Loadingstate';
import ErrorState from './components/ErrorState';
import OperationsList from './components/OperationsList';
import VerificationsList from './components/VerificationsList';

export default function CheckStatusOperation() {
  const { user } = useAuth();
  const router = useRouter();
  const [operations, setOperations] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  
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
  
  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchOperationStatus();
      fetchVerificationStatus();
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

  if (loading || verificationLoading) {
    return <LoadingState />;
  }
  
  if (loadingError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Update Operations */}
      <OperationsList operations={operations} />
      
      {/* Member Verification Status */}
      <VerificationsList 
        verifications={verifications} 
        onEdit={handleEditVerification} 
        onDelete={handleDeleteSubmission}
        deleteLoading={deleteLoading}
      />
      
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