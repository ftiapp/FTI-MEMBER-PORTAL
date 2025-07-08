'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook สำหรับจัดการการนำทางและ state ของฟอร์มสมัครสมาชิก AC (สมทบ-นิติบุคคล)
 * @param {Function} validateForm ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
 * @returns {Object} ฟังก์ชันและ state ที่ใช้ในการนำทาง
 */
export const useACFormNavigation = (validateForm) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  /**
   * ไปยังขั้นตอนถัดไป พร้อมตรวจสอบข้อมูล
   * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
   * @param {Function} setErrors ฟังก์ชันสำหรับกำหนดข้อผิดพลาด
   */
  const handleNextStep = async (formData, setErrors) => {
    // ตรวจสอบความถูกต้องของข้อมูลในขั้นตอนปัจจุบัน
    const errors = validateForm(formData, currentStep);
    setErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    // ตรวจสอบ Tax ID ในขั้นตอนที่ 1
    if (currentStep === 1 && formData.taxId && formData.taxId.length === 13) {
      try {
        const response = await fetch(`/api/ac-membership/check-tax-id?taxId=${formData.taxId}`);
        const data = await response.json();
        
        if (!data.isUnique) {
          setErrors(prev => ({ ...prev, taxId: data.message }));
          toast.error(data.message);
          return;
        }
      } catch (error) {
        console.error('Error checking tax ID:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี');
        return;
      }
    }

    // ไปยังขั้นตอนถัดไป
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  /**
   * ย้อนกลับไปขั้นตอนก่อนหน้า
   */
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep,
    handlePrevStep
  };
};
