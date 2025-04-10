'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import VerificationStatusDisplay from './components/VerificationStatusDisplay';
import MemberInfoForm from './components/MemberInfoForm';
import InfoAlert from './components/InfoAlert';

export default function WasMember() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    submitted: false,
    approved: false,
    rejected: false,
    rejectReason: null
  });
  const [formData, setFormData] = useState({
    memberSearch: '',
    memberNumber: '',
    memberType: '',
    companyName: '',
    taxId: '',
    registrationNumber: '',
    address: '',
    province: '',
    postalCode: '',
    phone: '',
    website: '',
    documentType: 'company_registration',
    documentFile: null
  });
  
  const [formErrors, setFormErrors] = useState({
    memberSearch: false,
    memberNumber: false,
    memberType: false,
    companyName: false,
    taxId: false,
    registrationNumber: false,
    address: false,
    province: false,
    postalCode: false,
    phone: false,
    documentFile: false
  });
  
  const [selectedResult, setSelectedResult] = useState(null);

  // Fetch verification status when component mounts
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user || !user.id) return;
      
      try {
        const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }
        
        const data = await response.json();
        setVerificationStatus({
          isLoading: false,
          submitted: data.submitted,
          approved: data.approved,
          rejected: data.rejected,
          rejectReason: data.rejectReason
        });
        
        // Hide form if verification is already submitted and not rejected
        if (data.submitted && !data.rejected) {
          setShowForm(false);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    fetchVerificationStatus();
  }, [user]);

  const handleSubmit = async (formSubmitData) => {
    try {
      setIsSubmitting(true);
      
      // Create form data for file upload
      const data = new FormData();
      data.append('userId', user?.id || '');
      data.append('memberNumber', formSubmitData.memberNumber);
      data.append('memberType', formSubmitData.memberType);
      data.append('companyName', formSubmitData.companyName);
      data.append('companyType', formSubmitData.memberType);
      data.append('registrationNumber', formSubmitData.registrationNumber);
      data.append('taxId', formSubmitData.taxId);
      data.append('address', formSubmitData.address);
      data.append('province', formSubmitData.province);
      data.append('postalCode', formSubmitData.postalCode);
      data.append('phone', formSubmitData.phone);
      data.append('website', formSubmitData.website);
      data.append('documentType', formSubmitData.documentType);
      data.append('documentFile', formSubmitData.documentFile);
      
      // Submit data to API
      const response = await fetch('/api/member/submit', {
        method: 'POST',
        body: data
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 1-2 วันทำการ');
        
        // Update verification status and hide form
        setVerificationStatus({
          isLoading: false,
          submitted: true,
          approved: false,
          rejected: false,
          rejectReason: null
        });
        setShowForm(false);
        
        // Reset form
        setFormData({
          memberSearch: '',
          memberNumber: '',
          memberType: '',
          companyName: '',
          taxId: '',
          registrationNumber: '',
          address: '',
          province: '',
          postalCode: '',
          phone: '',
          website: '',
          documentType: 'company_registration',
          documentFile: null
        });
        
        // Reset errors
        setFormErrors({
          memberSearch: false,
          memberNumber: false,
          memberType: false,
          companyName: false,
          taxId: false,
          registrationNumber: false,
          address: false,
          province: false,
          postalCode: false,
          phone: false,
          documentFile: false
        });
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {verificationStatus.isLoading ? (
        <VerificationStatusDisplay type="loading" />
      ) : verificationStatus.submitted && !verificationStatus.approved && !verificationStatus.rejected ? (
        <VerificationStatusDisplay type="submitted" />
      ) : verificationStatus.approved ? (
        <VerificationStatusDisplay type="approved" />
      ) : verificationStatus.rejected ? (
        <VerificationStatusDisplay 
          type="rejected" 
          rejectReason={verificationStatus.rejectReason} 
        />
      ) : (
        <>
          <InfoAlert />
          <MemberInfoForm 
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            selectedResult={selectedResult}
            setSelectedResult={setSelectedResult}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
