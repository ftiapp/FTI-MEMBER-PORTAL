'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useICMembershipForm } from '../hooks/useICMembershipForm';
import { validateFile, formatFileSize } from '../utils/fileUtils';
import { 
  validateThaiID, 
  validateEmail, 
  validateMobile, 
  validatePostalCode, 
  validateThaiText, 
  validateEnglishText 
} from '../utils/validationUtils';
import ApplicantInfoSection from './ApplicantInfoSection';
import RepresentativeInfoSection from './RepresentativeInfoSection';
import AddressSection from './AddressSection';
import BusinessInfoSection from './BusinessInfoSection';
import FileUploadSection from './FileUploadSection';
import ErrorNotification from './ErrorNotification';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const FORM_CONFIG = {
  TOTAL_STEPS: 4,
  STEP_LABELS: [
    'ข้อมูลสมาชิก',
    'นามผู้แทนใช้สิทธิ', 
    'ที่อยู่ในการจัดส่งเอกสาร',
    'รายละเอียดอื่นๆ'
  ],
  MESSAGES: {
    VALIDATION_ERROR: 'กรุณาตรวจสอบข้อมูลและแก้ไขข้อผิดพลาด',
    SUBMIT_ERROR: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองอีกครั้ง',
    SUBMITTING: 'กำลังส่งข้อมูล...',
    SUBMIT: 'ส่งใบสมัคร'
  }
};

const VALIDATION_RULES = {
  1: [
    { 
      field: 'idCardNumber', 
      required: true, 
      validator: validateThaiID, 
      messages: { 
        required: 'กรุณากรอกเลขบัตรประชาชน', 
        invalid: 'เลขบัตรประชาชนไม่ถูกต้อง กรุณากรอกเป็นตัวเลข 13 หลัก' 
      }
    },
    { 
      field: 'firstNameThai', 
      required: true, 
      validator: validateThaiText,
      messages: { 
        required: 'กรุณากรอกชื่อ (ภาษาไทย)', 
        invalid: 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น' 
      }
    },
    { 
      field: 'lastNameThai', 
      required: true, 
      validator: validateThaiText,
      messages: { 
        required: 'กรุณากรอกนามสกุล (ภาษาไทย)', 
        invalid: 'กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น' 
      }
    },
    { 
      field: 'firstNameEnglish', 
      required: false, 
      validator: validateEnglishText,
      messages: { invalid: 'กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น' }
    },
    { 
      field: 'lastNameEnglish', 
      required: false, 
      validator: validateEnglishText,
      messages: { invalid: 'กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น' }
    }
  ],
  2: [
    { 
      field: 'representativeFirstNameThai', 
      required: true, 
      validator: validateThaiText,
      messages: { 
        required: 'กรุณากรอกชื่อผู้แทน (ภาษาไทย)', 
        invalid: 'กรุณากรอกชื่อผู้แทนเป็นภาษาไทยเท่านั้น' 
      }
    },
    { 
      field: 'representativeLastNameThai', 
      required: true, 
      validator: validateThaiText,
      messages: { 
        required: 'กรุณากรอกนามสกุลผู้แทน (ภาษาไทย)', 
        invalid: 'กรุณากรอกนามสกุลผู้แทนเป็นภาษาไทยเท่านั้น' 
      }
    },
    { 
      field: 'representativeEmail', 
      required: true, 
      validator: validateEmail,
      messages: { 
        required: 'กรุณากรอกอีเมลผู้แทน', 
        invalid: 'รูปแบบอีเมลไม่ถูกต้อง' 
      }
    },
    { 
      field: 'representativeMobile', 
      required: true, 
      validator: validateMobile,
      messages: { 
        required: 'กรุณากรอกเบอร์มือถือผู้แทน', 
        invalid: 'รูปแบบเบอร์มือถือไม่ถูกต้อง' 
      }
    }
  ],
  3: [
    { 
      field: 'addressNumber', 
      required: true,
      messages: { required: 'กรุณากรอกเลขที่' }
    },
    { 
      field: 'addressSubdistrict', 
      required: true,
      messages: { required: 'กรุณากรอกตำบล/แขวง' }
    },
    { 
      field: 'addressDistrict', 
      required: true,
      messages: { required: 'กรุณากรอกอำเภอ/เขต' }
    },
    { 
      field: 'addressProvince', 
      required: true,
      messages: { required: 'กรุณากรอกจังหวัด' }
    },
    { 
      field: 'addressPostalCode', 
      required: true, 
      validator: validatePostalCode,
      messages: { 
        required: 'กรุณากรอกรหัสไปรษณีย์', 
        invalid: 'รหัสไปรษณีย์ไม่ถูกต้อง' 
      }
    },
    { 
      field: 'contactEmail', 
      required: true, 
      validator: validateEmail,
      messages: { 
        required: 'กรุณากรอกอีเมล', 
        invalid: 'รูปแบบอีเมลไม่ถูกต้อง' 
      }
    },
    { 
      field: 'contactMobile', 
      required: true, 
      validator: validateMobile,
      messages: { 
        required: 'กรุณากรอกเบอร์มือถือ', 
        invalid: 'รูปแบบเบอร์มือถือไม่ถูกต้อง' 
      }
    }
  ],
  4: [
    { 
      field: 'businessTypes', 
      required: true, 
      validator: (value) => Array.isArray(value) && value.length > 0,
      messages: { required: 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท' }
    },
    { 
      field: 'businessTypeOther', 
      required: false, 
      conditional: (formData) => formData.businessTypes?.includes('other'),
      messages: { required: 'กรุณาระบุประเภทธุรกิจอื่นๆ' }
    },
    { 
      field: 'productsThai', 
      required: true,
      messages: { required: 'กรุณากรอกผลิตภัณฑ์/บริการ (ภาษาไทย)' }
    },
    { 
      field: 'idCardFile', 
      required: true,
      messages: { required: 'กรุณาแนบสำเนาบัตรประชาชนพร้อมเซ็นกำกับ' }
    }
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const scrollToElement = (elementName) => {
  const element = document.querySelector(`[name="${elementName}"]`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const isEmpty = (value) => {
  // ตรวจสอบค่าว่าง
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

// ============================================================================
// STEP VALIDATION LOGIC
// ============================================================================

const validateStepData = (step, formData) => {
  const rules = VALIDATION_RULES[step];
  if (!rules) return { isValid: true, errors: {} };

  const errors = {};
  let isValid = true;

  console.log(`Validating step ${step} with rules:`, rules);
  console.log(`Form data for validation:`, formData);

  // สำหรับขั้นตอนที่ 3 (ที่อยู่) ให้ตรวจสอบแบบพิเศษ
  if (step === 3) {
    console.log('Special validation for address section');
    
    // ตรวจสอบเฉพาะฟิลด์ที่จำเป็นจริงๆ
    const requiredFields = ['addressNumber', 'addressSubdistrict', 'addressDistrict', 'addressProvince', 'addressPostalCode'];
    
    for (const field of requiredFields) {
      const value = formData[field];
      console.log(`Checking required field ${field}:`, value);
      
      // ตรวจสอบว่าค่าว่างหรือไม่
      if (!value || value.trim() === '') {
        const rule = rules.find(r => r.field === field);
        if (rule && rule.messages && rule.messages.required) {
          errors[field] = rule.messages.required;
          isValid = false;
          console.log(`Field ${field} is required but empty`);
        }
      }
      
      // ตรวจสอบรหัสไปรษณีย์
      if (field === 'addressPostalCode' && value) {
        const postalCodeRule = rules.find(r => r.field === 'addressPostalCode');
        if (postalCodeRule && postalCodeRule.validator && !postalCodeRule.validator(value)) {
          errors[field] = postalCodeRule.messages.invalid;
          isValid = false;
          console.log(`Postal code validation failed for value: ${value}`);
        }
      }
    }
  } else {
    // สำหรับขั้นตอนอื่นๆ ใช้การตรวจสอบปกติ
    for (const rule of rules) {
      const { field, required, validator, messages, conditional } = rule;
      const value = formData[field];
      const isFieldEmpty = isEmpty(value);
      const isConditionallyRequired = conditional ? conditional(formData) : required;
      
      console.log(`Validating field: ${field}`, { 
        value, 
        isEmpty: isFieldEmpty, 
        required: isConditionallyRequired 
      });
      
      // Check required fields
      if (isConditionallyRequired && isFieldEmpty) {
        errors[field] = messages.required;
        isValid = false;
        console.log(`Field ${field} failed required validation`);
        continue;
      }

      // Check validation rules for non-empty fields
      if (!isFieldEmpty && validator && !validator(value)) {
        errors[field] = messages.invalid;
        isValid = false;
        console.log(`Field ${field} failed validator validation`);
      }
    }
  }

  console.log(`Validation result:`, { isValid, errors });
  return { isValid, errors };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const StepIcon = React.memo(({ step, currentStep }) => {
  const isCompleted = currentStep > step;
  const isCurrent = currentStep === step;
  
  const getContainerClass = () => {
    if (isCompleted) return 'bg-green-500 text-white';
    if (isCurrent) return 'bg-blue-600 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const getIcon = () => {
    if (isCompleted) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    const icons = {
      1: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      2: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      3: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      4: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };

    return icons[step];
  };

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getContainerClass()}`}>
      {getIcon()}
    </div>
  );
});

StepIcon.displayName = 'StepIcon';

const ProgressHeader = React.memo(({ currentStep, totalSteps, stepLabels }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            <StepIcon step={index + 1} currentStep={currentStep} />
            <span className="text-xs mt-1 text-gray-600 text-center max-w-20">
              {stepLabels[index]}
            </span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 h-1 relative overflow-hidden rounded-full">
        <div 
          className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
          aria-label={`ความคืบหน้า ${progressPercentage.toFixed(0)}%`}
        />
      </div>
    </div>
  );
});

ProgressHeader.displayName = 'ProgressHeader';

const NavigationButtons = React.memo(({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onSubmit, 
  isLoading, 
  isSubmitting 
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
      {!isFirstStep ? (
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          disabled={isSubmitting}
          aria-label="ย้อนกลับไปขั้นตอนก่อนหน้า"
        >
          ← ย้อนกลับ
        </button>
      ) : (
        <div />
      )}
      
      {!isLastStep ? (
        <button
          type="button"
          onClick={(e) => onNext(e)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSubmitting}
          aria-label="ไปขั้นตอนถัดไป"
        >
          ถัดไป →
        </button>
      ) : (
        <button
          type="submit"
          onClick={onSubmit}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={isLoading || isSubmitting}
          aria-label="ส่งใบสมัครสมาชิก"
        >
          {isSubmitting ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {FORM_CONFIG.MESSAGES.SUBMITTING}
            </>
          ) : (
            <>
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
              {FORM_CONFIG.MESSAGES.SUBMIT}
            </>
          )}
        </button>
      )}
    </div>
  );
});

NavigationButtons.displayName = 'NavigationButtons';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ICMembershipForm({ onSubmit, isSubmitting }) {
  const {
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
  } = useICMembershipForm();

  const [currentStep, setCurrentStep] = useState(1);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStepValidation = useCallback((step) => {
    console.log(`Validating step ${step}`, formData);
    const { isValid, errors: validationErrors } = validateStepData(step, formData);
    console.log(`Validation result for step ${step}:`, { isValid, errors: validationErrors });
    
    if (!isValid) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        console.log(`Scrolling to error field: ${firstErrorField}`);
        scrollToElement(firstErrorField);
      }
    }
    
    return isValid;
  }, [formData, setErrors]);

  const handleNextStep = useCallback((e) => {
    // ป้องกันการส่งฟอร์มโดยอัตโนมัติ
    if (e) e.preventDefault();
    
    console.log('Next button clicked, current step:', currentStep);
    console.log('Form data before validation:', formData);
    
    // ตรวจสอบข้อมูลในขั้นตอนปัจจุบัน
    const isValid = handleStepValidation(currentStep);
    console.log('Step validation result:', isValid);
    
    if (isValid) {
      console.log('Moving to next step');
      setCurrentStep(prev => Math.min(prev + 1, FORM_CONFIG.TOTAL_STEPS));
      setErrors({});
      scrollToTop();
    } else {
      console.log('Validation failed, staying on current step');
      // แสดงข้อความแจ้งเตือนเพิ่มเติม
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }
  }, [currentStep, handleStepValidation, setErrors, formData]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
    scrollToTop();
  }, [setErrors]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const isValid = validateForm();
      
      if (isValid) {
        await onSubmit({ ...formData });
        resetForm();
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: FORM_CONFIG.MESSAGES.SUBMIT_ERROR
      }));
    }
  }, [formData, validateForm, onSubmit, resetForm, setErrors]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const stepContent = useMemo(() => {
    const commonProps = {
      formData,
      errors,
      handleChange,
      isLoading
    };

    const stepComponents = {
      1: (
        <ApplicantInfoSection 
          {...commonProps}
          handleCheckboxChange={handleCheckboxChange}
          industryGroups={industryGroups}
          provinceChapters={provinceChapters}
        />
      ),
      2: <RepresentativeInfoSection {...commonProps} />,
      3: <AddressSection {...commonProps} />,
      4: (
        <>
          <BusinessInfoSection
            {...commonProps}
            handleCheckboxChange={handleCheckboxChange}
            businessCategories={businessCategories}
          />
          <FileUploadSection
            formData={formData}
            errors={errors}
            handleFileChange={handleFileChange}
          />
        </>
      )
    };

    return stepComponents[currentStep] || null;
  }, [
    currentStep, 
    formData, 
    errors, 
    handleChange, 
    handleCheckboxChange, 
    handleFileChange, 
    isLoading,
    industryGroups,
    provinceChapters,
    businessCategories
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="bg-white rounded-lg shadow-md p-6">
        <ProgressHeader 
          currentStep={currentStep}
          totalSteps={FORM_CONFIG.TOTAL_STEPS}
          stepLabels={FORM_CONFIG.STEP_LABELS}
        />

        <form onSubmit={handleFormSubmit} noValidate>
          <div className="min-h-96">
            {stepContent}
          </div>
          
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={FORM_CONFIG.TOTAL_STEPS}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}