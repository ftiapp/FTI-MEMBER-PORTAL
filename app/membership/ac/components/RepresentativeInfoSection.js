'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * คอมโพเนนต์สำหรับกรอกข้อมูลผู้แทนนิติบุคคลในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 */
export default function RepresentativeInfoSection({ formData, setFormData, errors, setErrors }) {
  const representativeErrors = errors?.representativeErrors || [];
  
  const [representatives, setRepresentatives] = useState([{
    id: 1,
    firstNameThai: '',
    lastNameThai: '',
    firstNameEng: '',
    lastNameEng: '',
    email: '',
    phone: '',
    isPrimary: true
  }]);

  const [nextId, setNextId] = useState(2);
  
  // ลบ validation logic ออกจาก useEffect เพื่อป้องกันการ validate ซ้อน
  useEffect(() => {
    // อัปเดต formData เฉพาะข้อมูลเท่านั้น ไม่ validate
    setFormData(prev => ({
      ...prev,
      representatives: representatives
    }));
  }, [representatives, setFormData]);
  
  // Load initial data from formData only once when component mounts
  useEffect(() => {
    if (formData.representatives && formData.representatives.length > 0) {
      setRepresentatives(formData.representatives);
      const maxId = Math.max(...formData.representatives.map(rep => rep.id || 0));
      setNextId(maxId + 1);
    }
  }, []);

  const addRepresentative = () => {
    if (representatives.length < 3) {
      const newRep = {
        id: nextId,
        firstNameThai: '',
        lastNameThai: '',
        firstNameEng: '',
        lastNameEng: '',
        email: '',
        phone: '',
        isPrimary: false
      };
      
      setRepresentatives(prev => [...prev, newRep]);
      setNextId(prev => prev + 1);
    }
  };

  const removeRepresentative = (id) => {
    if (representatives.length > 1) {
      const updatedReps = representatives.filter(rep => rep.id !== id);
      
      const primaryExists = updatedReps.some(rep => rep.isPrimary);
      if (!primaryExists && updatedReps.length > 0) {
        updatedReps[0].isPrimary = true;
      }
      
      setRepresentatives(updatedReps);
    }
  };

  const validateThaiOnly = (value) => {
    const thaiPattern = /^[ก-๙\s]+$/;
    return thaiPattern.test(value);
  };

  const validateEnglishOnly = (value) => {
    const englishPattern = /^[a-zA-Z\s]+$/;
    return englishPattern.test(value);
  };

  const handleRepresentativeChange = (id, field, value) => {
    // ตรวจสอบ validation แบบ real-time เฉพาะการป้อนข้อมูลผิดรูปแบบ
    if ((field === 'firstNameThai' || field === 'lastNameThai') && value && value.trim() !== '') {
      if (!validateThaiOnly(value)) {
        setTimeout(() => {
          toast.error('กรุณากรอกเฉพาะภาษาไทยเท่านั้น', {
            position: 'top-right',
            duration: 3000
          });
        }, 0);
        return; // ไม่อัปเดตค่าถ้าไม่ถูกต้อง
      }
    }
    
    if ((field === 'firstNameEng' || field === 'lastNameEng') && value && value.trim() !== '') {
      if (!validateEnglishOnly(value)) {
        setTimeout(() => {
          toast.error('กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น', {
            position: 'top-right',
            duration: 3000
          });
        }, 0);
        return; // ไม่อัปเดตค่าถ้าไม่ถูกต้อง
      }
    }
    
    // อัปเดตค่าเฉพาะเมื่อผ่าน validation
    setRepresentatives(prev => 
      prev.map(rep => {
        if (rep.id === id) {
          return { ...rep, [field]: value };
        }
        return rep;
      })
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้แทนนิติบุคคล
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลผู้มีอำนาจลงนามแทนนิติบุคคล
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
                การเพิ่มผู้แทนนิติบุคคล
              </p>
              <p className="text-sm text-blue-700 mt-1">
                สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามแทนนิติบุคคลตามหนังสือรับรอง
              </p>
            </div>
          </div>
        </div>

        {/* Representatives List */}
        <div className="space-y-6">
          {representatives.map((rep, index) => (
            <div key={`rep-${rep.id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 overflow-visible relative">
              {/* Representative Header */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                <h3 className="text-base font-medium text-gray-900">
                  ผู้แทนคนที่ {index + 1}
                </h3>
                {representatives.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRepresentative(rep.id)}
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
                    id={`firstNameThai-${rep.id}`}
                    value={rep.firstNameThai || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'firstNameThai', e.target.value)}
                    required
                    placeholder="ชื่อภาษาไทย"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.firstNameThai 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.firstNameThai && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].firstNameThai}
                    </p>
                  )}
                </div>

                {/* Thai Last Name */}
                <div className="space-y-2">
                  <label htmlFor={`lastNameThai-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    นามสกุล (ภาษาไทย)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id={`lastNameThai-${rep.id}`}
                    value={rep.lastNameThai || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'lastNameThai', e.target.value)}
                    required
                    placeholder="นามสกุลภาษาไทย"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.lastNameThai 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.lastNameThai && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].lastNameThai}
                    </p>
                  )}
                </div>

                {/* English First Name */}
                <div className="space-y-2">
                  <label htmlFor={`firstNameEng-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    ชื่อ (ภาษาอังกฤษ)
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                  </label>
                  <input
                    type="text"
                    id={`firstNameEng-${rep.id}`}
                    value={rep.firstNameEng || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'firstNameEng', e.target.value)}
                    required
                    placeholder="First Name"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.firstNameEng 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.firstNameEng && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].firstNameEng}
                    </p>
                  )}
                </div>

                {/* English Last Name */}
                <div className="space-y-2">
                  <label htmlFor={`lastNameEng-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    นามสกุล (ภาษาอังกฤษ)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id={`lastNameEng-${rep.id}`}
                    value={rep.lastNameEng || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'lastNameEng', e.target.value)}
                    required
                    placeholder="Last Name"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.lastNameEng 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.lastNameEng && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].lastNameEng}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor={`email-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    อีเมล
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    id={`email-${rep.id}`}
                    value={rep.email || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'email', e.target.value)}
                    required
                    placeholder="example@company.com"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.email && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor={`phone-${rep.id}`} className="block text-sm font-medium text-gray-900">
                    เบอร์โทรศัพท์
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    id={`phone-${rep.id}`}
                    value={rep.phone || ''}
                    onChange={(e) => handleRepresentativeChange(rep.id, 'phone', e.target.value)}
                    required
                    placeholder="08X-XXX-XXXX"
                    maxLength={10}
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${representativeErrors[index]?.phone 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  {representativeErrors[index]?.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {representativeErrors[index].phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Representative Button */}
        {representatives.length < 3 && (
          <div className="mt-6 flex justify-center">
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
        
        {/* Document Requirements Note */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-900">
                รายการเอกสารที่ท่านต้องเตรียม
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                บัตรประจำตัวประชาชน พร้อม ลายเซ็นสำเนาถูกต้อง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}