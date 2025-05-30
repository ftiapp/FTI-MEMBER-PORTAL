'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  LoadingState, 
  ErrorState, 
  ProfileForm, 
  ConfirmationStep, 
  FinalStep, 
  UpdateStatusBanner,
  ProfileStepIndicator 
} from './components';

export default function UpdateMember() {
  const MAX_REQUESTS_PER_DAY = 3;

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [requestsToday, setRequestsToday] = useState(0);
  const [limitLoading, setLimitLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
      fetchUpdateStatus();
      fetchProfileUpdateLimit();
      
      // Update URL when component loads
      window.history.pushState({}, '', '/dashboard?tab=updatemember');
    }
  }, [user]);

  const fetchProfileUpdateLimit = async () => {
    setLimitLoading(true);
    try {
      const response = await fetch('/api/user/profile-update-limit');
      if (response.ok) {
        const data = await response.json();
        setRequestsToday(data.count || 0);
      }
    } catch (error) {
      setRequestsToday(0);
    } finally {
      setLimitLoading(false);
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    setLoadingError(false);
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      console.log('Fetched user data:', data); // เพิ่ม log เพื่อตรวจสอบข้อมูล
      setFormData({
        firstName: data.firstname || '',
        lastName: data.lastname || '',
        email: data.email || '',
        phone: data.phone || ''
      });
      setOriginalData({
        firstName: data.firstname || '',
        lastName: data.lastname || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoadingError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/user/profile-update-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUpdateStatus(data.status || null);
      }
    } catch (error) {
      console.error('Error fetching update status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ตรวจสอบเฉพาะชื่อ-นามสกุล และต้องมีการเปลี่ยนแปลงชื่อ-นามสกุลเท่านั้น
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('กรุณากรอกชื่อ - นามสกุล ที่ท่านต้องการแก้ไข');
      return false;
    }
    // ต้องมีการเปลี่ยนแปลงชื่อหรือนามสกุลเท่านั้น
    const hasNameChanged = (formData.firstName !== originalData.firstName) || (formData.lastName !== originalData.lastName);
    if (!hasNameChanged) {
      toast.error('กรุณากรอกชื่อ - นามสกุล ที่ท่านต้องการแก้ไข');
      return false;
    }
    return true;
  };

  // Toggle edit mode on/off
  const toggleEditMode = () => {
    if (editMode) {
      // If canceling edit, reset form data to original values
      setFormData({
        ...formData,
        firstName: originalData.firstName,
        lastName: originalData.lastName
      });
      setCurrentStep(1);
    }
    setEditMode(!editMode);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!validateForm()) return;
    if (requestsToday >= MAX_REQUESTS_PER_DAY) {
      toast.error('คุณได้ส่งคำขอครบจำนวนสูงสุดในวันนี้แล้ว กรุณารอวันถัดไป');
      return;
    }
    
    // Move to step 2 (confirmation) before submitting
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }
    
    // If user confirms, proceed with submission
    if (currentStep === 2) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: originalData.email,
            phone: originalData.phone
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('ส่งคำขอแก้ไขข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ');
          fetchUpdateStatus();
          setRequestsToday(r => r + 1);
          setCurrentStep(3);
          setEditMode(false);
        } else {
          toast.error(data.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        setCurrentStep(1);
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  // Handle confirmation of profile update
  const handleConfirmUpdate = async () => {
    await handleSubmit();
  };
  
  // Cancel update and return to step 1
  const handleCancelUpdate = () => {
    setCurrentStep(1);
  };

  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchUserData();
      fetchUpdateStatus();
    }
  };

  if (loading) {
    return <LoadingState />;
  }
  
  if (loadingError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Toaster position="top-center" />
      
      {/* Show update status banner if there's a pending or rejected update */}
      {updateStatus && (
        <UpdateStatusBanner 
          status={updateStatus} 
          requestsToday={requestsToday} 
          maxRequests={MAX_REQUESTS_PER_DAY} 
          limitLoading={limitLoading}
        />
      )}
      
      {/* Step Indicator */}
      {editMode || currentStep > 1 ? (
        <ProfileStepIndicator currentStep={currentStep} />
      ) : null}
      
      {/* Show different steps based on current step */}
      {currentStep === 1 && (
        <ProfileForm 
          formData={formData}
          originalData={originalData}
          editMode={editMode}
          toggleEditMode={toggleEditMode}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          submitting={submitting}
          requestsToday={requestsToday}
          maxRequests={MAX_REQUESTS_PER_DAY}
        />
      )}
      
      {currentStep === 2 && (
        <ConfirmationStep 
          formData={formData}
          originalData={originalData}
          handleConfirmUpdate={handleConfirmUpdate}
          handleCancelUpdate={handleCancelUpdate}
          submitting={submitting}
        />
      )}
      
      {currentStep === 3 && (
        <FinalStep />
      )}
    </motion.div>
  );
}
