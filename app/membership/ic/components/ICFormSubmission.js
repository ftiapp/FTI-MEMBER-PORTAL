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
    
    // Add applicant info with aligned field names
    submitData.append('idCardNumber', formData.idCardNumber);
    submitData.append('firstNameTh', formData.firstNameThai);
    submitData.append('lastNameTh', formData.lastNameThai);
    submitData.append('firstNameEn', formData.firstNameEng);
    submitData.append('lastNameEn', formData.lastNameEng);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    
    // Add address info - including optional fields
    submitData.append('addressNumber', formData.addressNumber);
    submitData.append('moo', formData.moo || ''); // Optional
    submitData.append('soi', formData.soi || ''); // Optional
    submitData.append('road', formData.street || ''); // Optional - API expects 'road'
    submitData.append('subDistrict', formData.subDistrict);
    submitData.append('district', formData.district);
    submitData.append('province', formData.province);
    submitData.append('postalCode', formData.postalCode);
    
    // Add optional website
    if (formData.website) {
      submitData.append('website', formData.website);
    }
    
    // Add industrial groups and provincial chapters with correct field names
    if (formData.industrialGroupIds) {
      submitData.append('industryGroups', JSON.stringify(formData.industrialGroupIds));
    }
    
    if (formData.provincialCouncilIds) {
      submitData.append('provinceChapters', JSON.stringify(formData.provincialCouncilIds));
    }
    
    // Add representative info as individual fields
    if (formData.representative) {
      const rep = formData.representative;
      submitData.append('representativeFirstNameTh', rep.firstNameThai);
      submitData.append('representativeLastNameTh', rep.lastNameThai);
      submitData.append('representativeFirstNameEn', rep.firstNameEng);
      submitData.append('representativeLastNameEn', rep.lastNameEng);
      submitData.append('representativeIdCardNumber', rep.idCardNumber);
      submitData.append('representativePhone', rep.phone);
      submitData.append('representativeEmail', rep.email);
      submitData.append('relationship', rep.relationship);
    }
    
    // Add business types - convert from object to array
    if (formData.businessTypes) {
      const businessTypesArray = Object.keys(formData.businessTypes).filter(key => formData.businessTypes[key]);
      submitData.append('businessTypes', JSON.stringify(businessTypesArray));
    }
    
    // Add other business type detail
    if (formData.otherBusinessTypeDetail) {
      submitData.append('businessCategoryOther', formData.otherBusinessTypeDetail);
    }
    
    // Add products
    submitData.append('products', JSON.stringify(formData.products));
    
    // Add document with correct field name
    if (formData.idCardDocument) {
      submitData.append('idCardFile', formData.idCardDocument);
    }
    
    // Submit form data to correct endpoint
    const response = await fetch('/api/member/ic-membership/submit', {
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