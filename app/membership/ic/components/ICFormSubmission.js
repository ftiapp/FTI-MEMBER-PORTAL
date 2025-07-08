'use client';

import { toast } from 'react-hot-toast';

// Check if ID card number is unique
export const checkIdCardUniqueness = async (idCardNumber) => {
  try {
    const response = await fetch('/api/ic-membership/check-id-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCardNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle API error
      return {
        success: false,
        message: data.message || 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน',
      };
    }

    if (data.exists) {
      // ID card already exists
      if (data.status === 0) {
        return {
          success: false,
          message: 'คำขอสมัครสมาชิกของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน',
        };
      } else if (data.status === 1) {
        return {
          success: false,
          message: 'หมายเลขบัตรประชาชนนี้ได้เป็นสมาชิกแล้ว กรุณาตรวจสอบหน้าข้อมูลสมาชิก',
        };
      }
    }

    // ID card is unique or has a different status
    return {
      success: true,
      message: 'เลขบัตรประชาชนสามารถใช้สมัครได้',
    };
  } catch (error) {
    console.error('Error checking ID card uniqueness:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน กรุณาลองใหม่อีกครั้ง',
    };
  }
};

// Submit IC membership form
export const submitICMembershipForm = async (formData) => {
  try {
    // Create FormData object for file uploads
    const submitData = new FormData();
    
    // Add member type
    submitData.append('memberType', 'IC'); // IC = สมทบ-บุคคลธรรมดา
    
    // Add applicant info
    submitData.append('idCardNumber', formData.idCardNumber);
    submitData.append('firstNameThai', formData.firstNameThai);
    submitData.append('lastNameThai', formData.lastNameThai);
    submitData.append('firstNameEng', formData.firstNameEng);
    submitData.append('lastNameEng', formData.lastNameEng);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    
    // Add address info
    submitData.append('addressNumber', formData.addressNumber);
    submitData.append('moo', formData.moo || '');
    submitData.append('soi', formData.soi || '');
    submitData.append('road', formData.road || '');
    submitData.append('subDistrict', formData.subDistrict);
    submitData.append('district', formData.district);
    submitData.append('province', formData.province);
    submitData.append('postalCode', formData.postalCode);
    
    // Add industrial group and provincial chapter (optional for IC)
    if (formData.industrialGroupId) {
      submitData.append('industrialGroupId', formData.industrialGroupId);
    }
    
    if (formData.provincialChapterId) {
      submitData.append('provincialChapterId', formData.provincialChapterId);
    }
    
    // Add representative info (only one for IC)
    submitData.append('representative', JSON.stringify(formData.representative));
    
    // Add business info
    submitData.append('businessTypes', JSON.stringify(formData.businessTypes));
    if (formData.businessTypes.other) {
      submitData.append('otherBusinessTypeDetail', formData.otherBusinessTypeDetail);
    }
    
    // Add products
    submitData.append('products', JSON.stringify(formData.products));
    
    // Add document (ID card)
    if (formData.idCardDocument) {
      submitData.append('idCardDocument', formData.idCardDocument);
    }
    
    // Submit form data
    const response = await fetch('/api/ic-membership', {
      method: 'POST',
      body: submitData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
      };
    }
    
    return {
      success: true,
      message: 'ส่งข้อมูลสำเร็จ',
      data: data,
    };
  } catch (error) {
    console.error('Error submitting IC membership form:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง',
    };
  }
};
