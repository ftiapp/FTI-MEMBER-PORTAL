'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

export default function RepresentativeInfoSection({ formData, setFormData, errors }) {
  // For IC form, only one representative is allowed
  const [representative, setRepresentative] = useState({
    prenameTh: '',
    prenameEn: '',
    prenameOther: '',
    prenameOtherEn: '',
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
  // helpers to read both snake_case and camelCase
  const getErr = (camelKey, snakeKey) => representativeErrors?.[camelKey] ?? representativeErrors?.[snakeKey];

  // Initialize representative from form data
  // ใช้ useEffect เพียงตัวเดียวเพื่อตั้งค่าเริ่มต้นของ representative จาก formData
  // เมื่อ component ถูกโหลดครั้งแรกเท่านั้น
  useEffect(() => {
    if (formData.representative) {
      setRepresentative({
        prenameTh: formData.representative.prenameTh || '',
        prenameEn: formData.representative.prenameEn || '',
        prenameOther: formData.representative.prenameOther || '',
        prenameOtherEn: formData.representative.prenameOtherEn || '',
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
    if ((field === 'firstNameEng' || field === 'lastNameEng' || field === 'prenameOtherEn') && value) {
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
    
    // Auto-select matching prename in the other language
    if (field === 'prenameTh') {
      // Map Thai prenames to English equivalents
      const thaiToEnglishMap = {
        'นาย': 'Mr',
        'นาง': 'Mrs',
        'นางสาว': 'Ms',
        'อื่นๆ': 'Other'
      };
      
      // If English prename is empty or doesn't match the Thai selection, update it
      if (!updatedRepresentative.prenameEn || thaiToEnglishMap[value] !== updatedRepresentative.prenameEn) {
        updatedRepresentative.prenameEn = thaiToEnglishMap[value] || '';
      }
    } else if (field === 'prenameEn') {
      // Map English prenames to Thai equivalents
      const englishToThaiMap = {
        'Mr': 'นาย',
        'Mrs': 'นาง',
        'Ms': 'นางสาว',
        'Other': 'อื่นๆ'
      };
      
      // If Thai prename is empty or doesn't match the English selection, update it
      if (!updatedRepresentative.prenameTh || englishToThaiMap[value] !== updatedRepresentative.prenameTh) {
        updatedRepresentative.prenameTh = englishToThaiMap[value] || '';
      }
    }
    
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

  // Create refs for prename fields
  const prenameThRef = useRef(null);
  const prenameEnRef = useRef(null);
  const prenameOtherRef = useRef(null);
  const prenameOtherEnRef = useRef(null);

  // Effect to check for prename errors and scroll to them
  useEffect(() => {
    if (representativeErrors) {
      if (getErr('prenameTh', 'prename_th') && prenameThRef.current) {
        prenameThRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error(getErr('prenameTh', 'prename_th') || 'กรุณาเลือกคำนำหน้าชื่อภาษาไทย', { position: 'top-right', style: { zIndex: 100000 } });
      } else if (getErr('prenameEn', 'prename_en') && prenameEnRef.current) {
        prenameEnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error(getErr('prenameEn', 'prename_en') || 'กรุณาเลือกคำนำหน้าชื่อภาษาอังกฤษ', { position: 'top-right', style: { zIndex: 100000 } });
      } else if (getErr('prenameOther', 'prename_other') && prenameOtherRef.current) {
        prenameOtherRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error(getErr('prenameOther', 'prename_other') || 'กรุณาระบุคำนำหน้าชื่ออื่นๆ', { position: 'top-right', style: { zIndex: 100000 } });
      } else if (getErr('prenameOtherEn', 'prename_other_en') && prenameOtherEnRef.current) {
        prenameOtherEnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast.error(getErr('prenameOtherEn', 'prename_other_en') || 'Please specify prename in English', { position: 'top-right', style: { zIndex: 100000 } });
      }
    }
  }, [representativeErrors]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10" data-section="representative-info">
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
                    ref={prenameThRef}
                    id="prenameTh"
                    name="prenameTh"
                    data-field="representative.prename_th"
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
                  {(getErr('prenameTh','prename_th')) && (
                    <p className="mt-1 text-sm text-red-600">{getErr('prenameTh','prename_th')}</p>
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
                      name="firstNameThai"
                      data-field="representative.firstNameThai"
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
                      name="lastNameThai"
                      data-field="representative.lastNameThai"
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
                <div className="mt-4" data-section="prename-other">
                  <label htmlFor="prenameOther" className="block text-sm font-medium text-gray-700 mb-1">
                    ระบุคำนำหน้า (ภาษาไทยเท่านั้น)
                  </label>
                  <input
                    ref={prenameOtherRef}
                    type="text"
                    id="prenameOther"
                    name="prenameOther"
                    data-field="representative.prename_other"
                    value={representative.prenameOther || ''}
                    onChange={(e) => handleRepresentativeChange('prenameOther', e.target.value)}
                    placeholder="เช่น ผศ.ดร., ศ.ดร., พ.ต.อ."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {(getErr('prenameOther','prename_other')) && (
                    <p className="mt-1 text-sm text-red-600">{getErr('prenameOther','prename_other')}</p>
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
                    ref={prenameEnRef}
                    id="prenameEn"
                    name="prenameEn"
                    data-field="representative.prename_en"
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
                  {(getErr('prenameEn','prename_en')) && (
                    <p className="mt-1 text-sm text-red-600">{getErr('prenameEn','prename_en')}</p>
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
                      name="firstNameEng"
                      data-field="representative.first_name_eng"
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
                      name="lastNameEng"
                      data-field="representative.last_name_eng"
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
              {/* Other English prename detail */}
              {String(representative.prenameEn || '').toLowerCase() === 'other' && (
                <div className="mt-4">
                  <label htmlFor="prenameOtherEn" className="block text-sm font-medium text-gray-700 mb-1">
                    Specify Prename (English only)
                  </label>
                  <input
                    ref={prenameOtherEnRef}
                    type="text"
                    id="prenameOtherEn"
                    name="prenameOtherEn"
                    data-field="representative.prename_other_en"
                    value={representative.prenameOtherEn || ''}
                    onChange={(e) => handleRepresentativeChange('prenameOtherEn', e.target.value)}
                    placeholder="e.g., Assoc. Prof., Dr., Col."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {(getErr('prenameOtherEn','prename_other_en')) && (
                    <p className="mt-1 text-sm text-red-600">{getErr('prenameOtherEn','prename_other_en')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Allowed characters: English letters, spaces, and dot (.)</p>
                </div>
              )}
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
                      name="representative.email"
                      data-field="representative.email"
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
                          name="representative.phone"
                          data-field="representative.phone"
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
                        name="representative.phoneExtension"
                        data-field="representative.phoneExtension"
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