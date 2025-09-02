'use client';

import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function RepresentativeInfoSection({ formData, setFormData, errors }) {
  // For IC form, only one representative is allowed
  const [representative, setRepresentative] = useState({
    prenameTh: '',
    prenameEn: '',
    prenameOther: '',
    firstNameThai: '',
    lastNameThai: '',
    firstNameEng: '',
    lastNameEng: '',
    email: '',
    phone: '',
    phoneExtension: ''
  });
  // Track touched state for phone to defer error display until after blur
  const [phoneTouched, setPhoneTouched] = useState(false);

  const representativeErrors = errors?.representativeErrors || {};

  // Initialize representative from form data
  // ใช้ useEffect เพียงตัวเดียวเพื่อตั้งค่าเริ่มต้นของ representative จาก formData
  // เมื่อ component ถูกโหลดครั้งแรกเท่านั้น
  useEffect(() => {
    if (formData.representative) {
      setRepresentative({
        prenameTh: formData.representative.prenameTh || '',
        prenameEn: formData.representative.prenameEn || '',
        prenameOther: formData.representative.prenameOther || '',
        firstNameThai: formData.representative.firstNameThai || '',
        lastNameThai: formData.representative.lastNameThai || '',
        firstNameEng: formData.representative.firstNameEng || '',
        lastNameEng: formData.representative.lastNameEng || '',
        email: formData.representative.email || '',
        phone: formData.representative.phone || '',
        phoneExtension: formData.representative.phoneExtension || ''
      });
    }
  }, []); // ไม่มี dependency เพื่อให้ทำงานเฉพาะครั้งแรกที่ component ถูกโหลด

  // Handle representative input changes
  const handleRepresentativeChange = (field, value) => {
    // Thai language validation
    if ((field === 'firstNameThai' || field === 'lastNameThai' || field === 'prenameOther') && value) {
      const thaiPattern = /^[ก-๙\s]*$/;
      if (!thaiPattern.test(value) && value !== '') {
        // Allow input but don't update state
        return;
      }
    }
    
    // English language validation
    if ((field === 'firstNameEng' || field === 'lastNameEng') && value) {
      const engPattern = /^[a-zA-Z\s]*$/;
      if (!engPattern.test(value) && value !== '') {
        // Allow input but don't update state
        return;
      }
    }

    // อัปเดต local state
    const updatedRepresentative = {
      ...representative,
      [field]: value
    };
    
    setRepresentative(updatedRepresentative);
    
    // อัปเดต formData โดยตรง
    setFormData(prev => ({
      ...prev,
      representative: updatedRepresentative
    }));
  };

  // Error icon component
  const ErrorIcon = useMemo(() => (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลผู้แทน</h2>
        <p className="text-blue-100 text-sm mt-1">ข้อมูลผู้แทนที่สามารถติดต่อได้</p>
      </div>
      
      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">ข้อมูลผู้แทน</h3>
          <p className="text-sm text-gray-600 mb-6">กรุณากรอกข้อมูลผู้แทนที่สามารถติดต่อได้</p>
          
          <div className="space-y-8">
            {/* Thai Name Section - ด้านบน */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ชื่อภาษาไทย</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Prename Thai */}
                <div>
                  <label htmlFor="prenameTh" className="block text-sm font-medium text-gray-700 mb-1">
                    คำนำหน้า
                  </label>
                  <select
                    id="prenameTh"
                    value={representative.prenameTh || ''}
                    onChange={(e) => handleRepresentativeChange('prenameTh', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {representativeErrors?.prenameTh && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.prenameTh}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="firstNameThai"
                      value={representative.firstNameThai || ''}
                      onChange={(e) => handleRepresentativeChange('firstNameThai', e.target.value)}
                      placeholder="กรอกชื่อภาษาไทย"
                      className={`w-full px-4 py-2 border ${
                        representativeErrors?.firstNameThai ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {representativeErrors?.firstNameThai && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        {ErrorIcon}
                      </div>
                    )}
                  </div>
                  {representativeErrors?.firstNameThai && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.firstNameThai}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastNameThai"
                      value={representative.lastNameThai || ''}
                      onChange={(e) => handleRepresentativeChange('lastNameThai', e.target.value)}
                      placeholder="กรอกนามสกุลภาษาไทย"
                      className={`w-full px-4 py-2 border ${
                        representativeErrors?.lastNameThai ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {representativeErrors?.lastNameThai && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        {ErrorIcon}
                      </div>
                    )}
                  </div>
                  {representativeErrors?.lastNameThai && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.lastNameThai}</p>
                  )}
                </div>
              </div>

              {/* Other Thai prename detail */}
              {representative.prenameTh === 'อื่นๆ' && (
                <div className="mt-4">
                  <label htmlFor="prenameOther" className="block text-sm font-medium text-gray-700 mb-1">
                    ระบุคำนำหน้า (ภาษาไทยเท่านั้น)
                  </label>
                  <input
                    type="text"
                    id="prenameOther"
                    value={representative.prenameOther || ''}
                    onChange={(e) => handleRepresentativeChange('prenameOther', e.target.value)}
                    placeholder="เช่น ผศ.ดร., ศ.ดร., พ.ต.อ."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {representativeErrors?.prenameOther && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.prenameOther}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">รองรับตัวอักษรไทย เว้นวรรค และจุด (.)</p>
                </div>
              )}
            </div>

            {/* English Name Section - ด้านล่าง */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ชื่อภาษาอังกฤษ</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Prename English */}
                <div>
                  <label htmlFor="prenameEn" className="block text-sm font-medium text-gray-700 mb-1">
                    Prename
                  </label>
                  <select
                    id="prenameEn"
                    value={representative.prenameEn || ''}
                    onChange={(e) => handleRepresentativeChange('prenameEn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Prename</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Other">Other</option>
                  </select>
                  {representativeErrors?.prenameEn && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.prenameEn}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="firstNameEng" className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="firstNameEng"
                      value={representative.firstNameEng || ''}
                      onChange={(e) => handleRepresentativeChange('firstNameEng', e.target.value)}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-2 border ${
                        representativeErrors?.firstNameEng ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {representativeErrors?.firstNameEng && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        {ErrorIcon}
                      </div>
                    )}
                  </div>
                  {representativeErrors?.firstNameEng && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.firstNameEng}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastNameEng" className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastNameEng"
                      value={representative.lastNameEng || ''}
                      onChange={(e) => handleRepresentativeChange('lastNameEng', e.target.value)}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-2 border ${
                        representativeErrors?.lastNameEng ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {representativeErrors?.lastNameEng && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        {ErrorIcon}
                      </div>
                    )}
                  </div>
                  {representativeErrors?.lastNameEng && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.lastNameEng}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ข้อมูลติดต่อ</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={representative.email || ''}
                      onChange={(e) => handleRepresentativeChange('email', e.target.value)}
                      placeholder="กรอกอีเมล"
                      className={`w-full px-4 py-2 border ${
                        representativeErrors?.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {representativeErrors?.email && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        {ErrorIcon}
                      </div>
                    )}
                  </div>
                  {representativeErrors?.email && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.email}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          value={representative.phone || ''}
                          onChange={(e) => handleRepresentativeChange('phone', e.target.value)}
                          onBlur={() => setPhoneTouched(true)}
                          placeholder="02-123-4567"
                          className={`w-full px-4 py-2 border ${
                            (phoneTouched && representativeErrors?.phone) ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {phoneTouched && representativeErrors?.phone && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                            {ErrorIcon}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={representative.phoneExtension || ''}
                        onChange={(e) => handleRepresentativeChange('phoneExtension', e.target.value)}
                        placeholder="ต่อ (ถ้ามี)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {phoneTouched && representativeErrors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{representativeErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

RepresentativeInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object
};

RepresentativeInfoSection.defaultProps = {
  errors: {}
};