'use client';

import { useState, useEffect } from 'react';

export default function RepresentativeInfoSection({ formData, setFormData, errors }) {
  const representativeErrors = errors?.representativeErrors || [];
  
  const [representatives, setRepresentatives] = useState([{
    id: 1,
    firstNameThai: '',
    lastNameThai: '',
    firstNameEng: '',
    lastNameEng: '',
    email: '',
    phone: ''
  }]);

  const [nextId, setNextId] = useState(2);
  
  // อัพเดท formData เมื่อ representatives เปลี่ยน
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      representatives: representatives
    }));
  }, [representatives, setFormData]);
  
  // โหลดข้อมูลจาก formData ตอน component mount
  useEffect(() => {
    if (formData.representatives && formData.representatives.length > 0) {
      // ตรวจสอบและกำหนด id ให้กับ representatives ที่ไม่มี id หรือ id เป็น undefined/null
      const repsWithIds = formData.representatives.map((rep, index) => ({
        ...rep,
        id: rep.id && !isNaN(rep.id) ? rep.id : index + 1
      }));
      
      setRepresentatives(repsWithIds);
      
      // หา maxId ที่ถูกต้อง
      const validIds = repsWithIds.map(rep => rep.id).filter(id => !isNaN(id));
      const maxId = validIds.length > 0 ? Math.max(...validIds) : 1;
      setNextId(maxId + 1);
    }
  }, []);

  const addRepresentative = () => {
    if (representatives.length < 3) {
      setRepresentatives(prev => [
        ...prev,
        {
          id: nextId,
          firstNameThai: '',
          lastNameThai: '',
          firstNameEng: '',
          lastNameEng: '',
          email: '',
          phone: ''
        }
      ]);
      setNextId(prev => prev + 1);
    }
  };

  const removeRepresentative = (id) => {
    if (representatives.length > 1) {
      setRepresentatives(prev => prev.filter(rep => {
        // ใช้ string comparison เพื่อความปลอดภัย
        return String(rep.id) !== String(id);
      }));
    }
  };

  const handleRepresentativeChange = (id, field, value) => {
    setRepresentatives(prev => 
      prev.map(rep => {
        // ใช้ string comparison เพื่อความปลอดภัย
        if (String(rep.id) === String(id)) {
          // ตรวจสอบชื่อภาษาไทย
          if ((field === 'firstNameThai' || field === 'lastNameThai') && value) {
            const thaiPattern = /^[ก-๙\s]+$/;
            if (!thaiPattern.test(value) && value.trim() !== '') {
              // ยังให้อัพเดทค่าได้ แต่จะมี error
              return {
                ...rep,
                [field]: value
              };
            }
          }

          // ตรวจสอบชื่อภาษาอังกฤษ
          if ((field === 'firstNameEng' || field === 'lastNameEng') && value) {
            const engPattern = /^[a-zA-Z\s]+$/;
            if (!engPattern.test(value) && value.trim() !== '') {
              // ยังให้อัพเดทค่าได้ แต่จะมี error
              return {
                ...rep,
                [field]: value
              };
            }
          }
          
          // อัพเดทค่าปกติ
          return { ...rep, [field]: value };
        }
        return rep;
      })
    );
  };

  // ฟังก์ชันตรวจสอบ error แต่ละฟิลด์
  const getFieldError = (rep, field, index) => {
    // ตรวจสอบ error จาก server validation ก่อน
    if (representativeErrors[index]?.[field]) {
      return representativeErrors[index][field];
    }

    // ตรวจสอบ client-side validation
    const value = rep[field];
    if (!value || value.trim() === '') {
      return null; // ไม่แสดง error ถ้าฟิลด์ว่าง
    }

    if (field === 'firstNameThai' || field === 'lastNameThai') {
      const thaiPattern = /^[ก-๙\s]+$/;
      if (!thaiPattern.test(value)) {
        return 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
      }
    }

    if (field === 'firstNameEng' || field === 'lastNameEng') {
      const engPattern = /^[a-zA-Z\s]+$/;
      if (!engPattern.test(value)) {
        return 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น';
      }
    }

    if (field === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    }

    if (field === 'phone') {
      const phonePattern = /^[0-9\-\s\+\(\)]{10,15}$/;
      if (!phonePattern.test(value)) {
        return 'รูปแบบเบอร์โทรไม่ถูกต้อง';
      }
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้แทนสมาคม
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลผู้มีอำนาจลงนามแทนสมาคม
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 overflow-visible relative">
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                การเพิ่มผู้แทนสมาคม
              </p>
              <p className="text-sm text-blue-700 mt-1">
                สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามแทนสมาคมตามหนังสือรับรอง
              </p>
            </div>
          </div>
        </div>

        {/* Representatives List */}
        <div className="space-y-6">
          {representatives.map((rep, index) => {
            // ตรวจสอบให้แน่ใจว่า rep.id มีค่าและไม่เป็น NaN
            const repId = rep.id && !isNaN(rep.id) ? rep.id : `temp-${index}`;
            
            return (
              <div key={repId} className="bg-white border border-gray-200 rounded-lg p-6 overflow-visible">
              {/* Representative Header */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                <h3 className="text-base font-medium text-gray-900">
                  ผู้แทนคนที่ {index + 1}
                </h3>
                {representatives.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRepresentative(repId)}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    ลบ
                  </button>
                )}
              </div>
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thai First Name */}
                <div className="space-y-2">
                  <label htmlFor={`firstNameThai-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    ชื่อ (ภาษาไทย)
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                  </label>
                  <input
                    type="text"
                    id={`firstNameThai-${repId}`}
                    value={rep.firstNameThai || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'firstNameThai', e.target.value)}
                    required
                    placeholder="ชื่อภาษาไทย"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'firstNameThai', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'firstNameThai', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'firstNameThai', index)}
                    </p>
                  )}
                </div>

                {/* Thai Last Name */}
                <div className="space-y-2">
                  <label htmlFor={`lastNameThai-${repId}`} className="block text-sm font-medium text-gray-900">
                    นามสกุล (ภาษาไทย)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id={`lastNameThai-${repId}`}
                    value={rep.lastNameThai || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'lastNameThai', e.target.value)}
                    required
                    placeholder="นามสกุลภาษาไทย"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'lastNameThai', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'lastNameThai', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'lastNameThai', index)}
                    </p>
                  )}
                </div>

                {/* English First Name */}
                <div className="space-y-2">
                  <label htmlFor={`firstNameEng-${repId}`} className="block text-sm font-medium text-gray-900">
                    ชื่อ (ภาษาอังกฤษ)
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                  </label>
                  <input
                    type="text"
                    id={`firstNameEng-${repId}`}
                    value={rep.firstNameEng || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'firstNameEng', e.target.value)}
                    required
                    placeholder="First Name"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'firstNameEng', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'firstNameEng', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'firstNameEng', index)}
                    </p>
                  )}
                </div>

                {/* English Last Name */}
                <div className="space-y-2">
                  <label htmlFor={`lastNameEng-${repId}`} className="block text-sm font-medium text-gray-900">
                    นามสกุล (ภาษาอังกฤษ)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id={`lastNameEng-${repId}`}
                    value={rep.lastNameEng || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'lastNameEng', e.target.value)}
                    required
                    placeholder="Last Name"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'lastNameEng', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'lastNameEng', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'lastNameEng', index)}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor={`email-${repId}`} className="block text-sm font-medium text-gray-900">
                    อีเมล
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    id={`email-${repId}`}
                    value={rep.email || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'email', e.target.value)}
                    required
                    placeholder="example@association.com"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'email', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'email', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'email', index)}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor={`phone-${repId}`} className="block text-sm font-medium text-gray-900">
                    เบอร์โทรศัพท์
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    id={`phone-${repId}`}
                    value={rep.phone || ''}
                    onChange={(e) => handleRepresentativeChange(repId, 'phone', e.target.value)}
                    required
                    placeholder="08X-XXX-XXXX"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${getFieldError(rep, 'phone', index)
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {getFieldError(rep, 'phone', index) && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {getFieldError(rep, 'phone', index)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        
        {/* Add Representative Button */}
        {representatives.length < 3 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={addRepresentative}
              className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              เพิ่มผู้แทน ({representatives.length}/3)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}