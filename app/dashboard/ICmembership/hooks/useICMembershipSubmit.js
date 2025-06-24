'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useICMembershipSubmit = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/member/ic-membership/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }

      setSubmitSuccess(true);
      // Redirect to success page or show success message
      setTimeout(() => {
        router.push('/dashboard?tab=status');
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
  };
};
