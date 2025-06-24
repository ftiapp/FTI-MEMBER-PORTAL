'use client';

import { useState, useEffect } from 'react';
import { validateThaiID, validateThaiText, validateEnglishText } from '../utils/validationUtils';

export const useICMembershipForm = (initialValues = {}) => {
  const [formData, setFormData] = useState({
    // ส่วนที่ 1: ข้อมูลผู้สมัคร
    idCardNumber: '',
    firstNameThai: '',
    lastNameThai: '',
    firstNameEnglish: '',
    lastNameEnglish: '',
    selectedIndustryGroups: [],
    selectedProvinceChapters: [],
    
    // ส่วนที่ 2: ข้อมูลผู้แทนใช้สิทธิ
    representativeFirstNameThai: '',
    representativeLastNameThai: '',
    representativeFirstNameEnglish: '',
    representativeLastNameEnglish: '',
    representativeEmail: '',
    representativeMobile: '',
    
    // ส่วนที่ 3: ที่อยู่จัดส่งเอกสาร
    addressNumber: '',
    addressBuilding: '',
    addressMoo: '',
    addressSoi: '',
    addressRoad: '',
    addressSubdistrict: '',
    addressDistrict: '',
    addressProvince: '',
    addressPostalCode: '',
    website: '',
    facebook: '',
    phone: '',
    email: '',
    fax: '',
    
    // รายละเอียดอื่น
    businessTypes: [],
    businessTypeOther: '',
    
    // ประเภทธุรกิจ
    businessCategories: [],
    
    // ผลิตภัณฑ์/บริการ
    productsThai: '',
    productsEnglish: '',
    
    // ไฟล์แนบ
    idCardFile: null,
    ...initialValues,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [industryGroups, setIndustryGroups] = useState([]);
  const [provinceChapters, setProvinceChapters] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        // Fetch industry groups
        const industryResponse = await fetch('/api/member/ic-membership/industry-groups');
        const industryData = await industryResponse.json();
        
        // Fetch province chapters
        const provinceResponse = await fetch('/api/member/ic-membership/province-chapters');
        const provinceData = await provinceResponse.json();
        
        // Fetch business categories
        const categoriesResponse = await fetch('/api/member/ic-membership/business-categories');
        const categoriesData = await categoriesResponse.json();
        
        if (industryData.success) {
          setIndustryGroups(industryData.data);
        }
        
        if (provinceData.success) {
          setProvinceChapters(provinceData.data);
        }
        
        if (categoriesData.success) {
          setBusinessCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (name, value, isChecked) => {
    setFormData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          [name]: [...prev[name], value],
        };
      } else {
        return {
          ...prev,
          [name]: prev[name].filter((item) => item !== value),
        };
      }
    });
  };

  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.idCardNumber) {
      newErrors.idCardNumber = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (!validateThaiID(formData.idCardNumber)) {
      newErrors.idCardNumber = 'เลขบัตรประชาชนไม่ถูกต้อง';
    }
    
    // Thai name validation
    if (!formData.firstNameThai) {
      newErrors.firstNameThai = 'กรุณากรอกชื่อ (ภาษาไทย)';
    } else if (!validateThaiText(formData.firstNameThai)) {
      newErrors.firstNameThai = 'กรุณากรอกเป็นภาษาไทยเท่านั้น';
    }
    
    if (!formData.lastNameThai) {
      newErrors.lastNameThai = 'กรุณากรอกนามสกุล (ภาษาไทย)';
    } else if (!validateThaiText(formData.lastNameThai)) {
      newErrors.lastNameThai = 'กรุณากรอกเป็นภาษาไทยเท่านั้น';
    }
    
    // English name validation (if provided)
    if (formData.firstNameEnglish && !validateEnglishText(formData.firstNameEnglish)) {
      newErrors.firstNameEnglish = 'กรุณากรอกเป็นภาษาอังกฤษเท่านั้น';
    }
    
    if (formData.lastNameEnglish && !validateEnglishText(formData.lastNameEnglish)) {
      newErrors.lastNameEnglish = 'กรุณากรอกเป็นภาษาอังกฤษเท่านั้น';
    }
    
    // Dropdown validation
    if (formData.selectedIndustryGroups.length === 0) newErrors.selectedIndustryGroups = 'กรุณาเลือกกลุ่มอุตสาหกรรมอย่างน้อย 1 กลุ่ม';
    if (formData.selectedProvinceChapters.length === 0) newErrors.selectedProvinceChapters = 'กรุณาเลือกสภาอุตสาหกรรมจังหวัดอย่างน้อย 1 จังหวัด';
    
    // Representative validation
    if (!formData.representativeFirstNameThai) newErrors.representativeFirstNameThai = 'กรุณากรอกชื่อผู้แทน (ภาษาไทย)';
    if (!formData.representativeLastNameThai) newErrors.representativeLastNameThai = 'กรุณากรอกนามสกุลผู้แทน (ภาษาไทย)';
    if (!formData.representativeEmail) newErrors.representativeEmail = 'กรุณากรอกอีเมลผู้แทน';
    if (!formData.representativeMobile) newErrors.representativeMobile = 'กรุณากรอกเบอร์มือถือผู้แทน';
    
    // Address validation
    if (!formData.addressNumber) newErrors.addressNumber = 'กรุณากรอกเลขที่';
    if (!formData.addressSubdistrict) newErrors.addressSubdistrict = 'กรุณากรอกแขวง/ตำบล';
    if (!formData.addressDistrict) newErrors.addressDistrict = 'กรุณากรอกเขต/อำเภอ';
    if (!formData.addressProvince) newErrors.addressProvince = 'กรุณากรอกจังหวัด';
    if (!formData.addressPostalCode) newErrors.addressPostalCode = 'กรุณากรอกรหัสไปรษณีย์';
    
    // Business type validation
    if (formData.businessTypes.length === 0) newErrors.businessTypes = 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท';
    if (formData.businessTypes.includes('other') && !formData.businessTypeOther) {
      newErrors.businessTypeOther = 'กรุณาระบุประเภทธุรกิจอื่นๆ';
    }
    
    // Products validation
    if (!formData.productsThai) newErrors.productsThai = 'กรุณากรอกผลิตภัณฑ์/บริการ (ภาษาไทย)';
    
    // File validation
    if (!formData.idCardFile) newErrors.idCardFile = 'กรุณาแนบสำเนาบัตรประชาชนพร้อมเซ็นกำกับ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      idCardNumber: '',
      nameThai: '',
      nameEnglish: '',
      selectedIndustryGroups: [],
      selectedProvinceChapters: [],
      representativeNameThai: '',
      representativeNameEnglish: '',
      representativeEmail: '',
      representativeMobile: '',
      addressNumber: '',
      addressBuilding: '',
      addressMoo: '',
      addressSoi: '',
      addressRoad: '',
      addressSubdistrict: '',
      addressDistrict: '',
      addressProvince: '',
      addressPostalCode: '',
      website: '',
      facebook: '',
      phone: '',
      email: '',
      fax: '',
      businessTypes: [],
      businessTypeOther: '',
      businessCategories: [],
      productsThai: '',
      productsEnglish: '',
      idCardFile: null,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    setErrors,
    isLoading,
    industryGroups,
    provinceChapters,
    businessCategories,
    handleChange,
    handleCheckboxChange,
    handleFileChange,
    validateForm,
    resetForm,
  };
};
