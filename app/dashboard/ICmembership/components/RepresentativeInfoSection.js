'use client';

import { useEffect } from 'react';

export default function RepresentativeInfoSection({
  formData,
  errors,
  handleChange
}) {
  // Auto scroll to first error
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorFields = Object.keys(errors);
      const firstErrorField = errorFields[0];
      const firstErrorElement = document.getElementById(firstErrorField);
      
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // Optional: Focus on the input field
        firstErrorElement.focus();
      }
    }
  }, [errors]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">นามผู้แทนใช้สิทธิ</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ชื่อผู้แทน (ภาษาไทย) */}
        <div className="relative">
          <label htmlFor="representativeFirstNameThai" className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อผู้แทน (ภาษาไทย) <span className="text-red-500">*</span>
            <span className="text-xs text-red-500 ml-1">(ไม่ต้องใส่คำนำหน้า)</span>
          </label>
          <input
            type="text"
            id="representativeFirstNameThai"
            name="representativeFirstNameThai"
            value={formData.representativeFirstNameThai || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.representativeFirstNameThai ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="ชื่อผู้แทน (ภาษาไทย)"
          />
          {errors.representativeFirstNameThai && (
            <div className="absolute top-0 right-0 -mt-1 -mr-1">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                <div className="relative">
                  {errors.representativeFirstNameThai}
                  {/* Arrow pointing down-left */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* นามสกุลผู้แทน (ภาษาไทย) */}
        <div className="relative">
          <label htmlFor="representativeLastNameThai" className="block text-sm font-medium text-gray-700 mb-1">
            นามสกุลผู้แทน (ภาษาไทย) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="representativeLastNameThai"
            name="representativeLastNameThai"
            value={formData.representativeLastNameThai || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.representativeLastNameThai ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="นามสกุลผู้แทน (ภาษาไทย)"
          />
          {errors.representativeLastNameThai && (
            <div className="absolute top-0 right-0 -mt-1 -mr-1">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                <div className="relative">
                  {errors.representativeLastNameThai}
                  {/* Arrow pointing down-left */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ชื่อผู้แทน (ภาษาอังกฤษ) */}
        <div className="relative">
          <label htmlFor="representativeFirstNameEnglish" className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อผู้แทน (ภาษาอังกฤษ)
            <span className="text-xs text-red-500 ml-1">(ไม่ต้องใส่คำนำหน้า)</span>
          </label>
          <input
            type="text"
            id="representativeFirstNameEnglish"
            name="representativeFirstNameEnglish"
            value={formData.representativeFirstNameEnglish || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="ชื่อผู้แทน (ภาษาอังกฤษ)"
          />
        </div>
        
        {/* นามสกุลผู้แทน (ภาษาอังกฤษ) */}
        <div className="relative">
          <label htmlFor="representativeLastNameEnglish" className="block text-sm font-medium text-gray-700 mb-1">
            นามสกุลผู้แทน (ภาษาอังกฤษ)
          </label>
          <input
            type="text"
            id="representativeLastNameEnglish"
            name="representativeLastNameEnglish"
            value={formData.representativeLastNameEnglish || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="นามสกุลผู้แทน (ภาษาอังกฤษ)"
          />
        </div>
        
        {/* อีเมลผู้แทน */}
        <div className="relative">
          <label htmlFor="representativeEmail" className="block text-sm font-medium text-gray-700 mb-1">
            อีเมลผู้แทน <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="representativeEmail"
            name="representativeEmail"
            value={formData.representativeEmail}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.representativeEmail ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="example@email.com"
          />
          {errors.representativeEmail && (
            <div className="absolute top-0 right-0 -mt-1 -mr-1">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                <div className="relative">
                  {errors.representativeEmail}
                  {/* Arrow pointing down-left */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* เบอร์มือถือผู้แทน */}
        <div className="relative">
          <label htmlFor="representativeMobile" className="block text-sm font-medium text-gray-700 mb-1">
            เบอร์มือถือผู้แทน <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="representativeMobile"
            name="representativeMobile"
            value={formData.representativeMobile}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.representativeMobile ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="0XXXXXXXXX"
            maxLength={10}
          />
          {errors.representativeMobile && (
            <div className="absolute top-0 right-0 -mt-1 -mr-1">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                <div className="relative">
                  {errors.representativeMobile}
                  {/* Arrow pointing down-left */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              ผู้แทนใช้สิทธิ คือ บุคคลที่ได้รับมอบหมายให้เป็นผู้แทนของสมาชิกในการใช้สิทธิต่างๆ ในสภาอุตสาหกรรม เช่น การเข้าร่วมประชุม การออกเสียงลงคะแนน หรือการรับข้อมูลข่าวสารจากสภาอุตสาหกรรม
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}