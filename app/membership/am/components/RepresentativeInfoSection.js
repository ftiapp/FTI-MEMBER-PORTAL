'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function RepresentativeInfoSection({ formData = {}, setFormData = () => {}, errors = {} }) {
  const representativeErrors = errors?.representativeErrors || [];
  const isInitialized = useRef(false);
  
  // สร้าง default representative object
  const createDefaultRepresentative = (index = 0) => ({
    id: `rep_${Date.now()}_${index}`,
    firstNameTh: '',
    lastNameTh: '',
    firstNameEn: '',
    lastNameEn: '',
    position: '',
    email: '',
    phone: '',
    phoneExtension: '',
    isPrimary: index === 0
  });

  const [representatives, setRepresentatives] = useState([createDefaultRepresentative()]);

  // โหลดข้อมูลเริ่มต้นเพียงครั้งเดียว
  useEffect(() => {
    if (!isInitialized.current && formData.representatives?.length > 0) {
      const loadedReps = formData.representatives.map((rep, index) => ({
        id: rep.id || `rep_${Date.now()}_${index}`,
        firstNameTh: rep.firstNameTh || rep.firstNameThai || '',
        lastNameTh: rep.lastNameTh || rep.lastNameThai || '',
        firstNameEn: rep.firstNameEn || rep.firstNameEng || rep.firstNameEnglish || '',
        lastNameEn: rep.lastNameEn || rep.lastNameEng || rep.lastNameEnglish || '',
        position: rep.position || '',
        email: rep.email || '',
        phone: rep.phone || '',
        phoneExtension: rep.phoneExtension || rep.phone_extension || '',
        isPrimary: rep.isPrimary || index === 0
      }));
      setRepresentatives(loadedReps);
      isInitialized.current = true;
    }
  }, [formData.representatives]);

  // Sync กับ formData เมื่อ representatives เปลี่ยน
  useEffect(() => {
    if (isInitialized.current || !formData.representatives?.length) {
      setFormData(prev => ({ ...prev, representatives }));
    }
  }, [representatives, setFormData]);

  const addRepresentative = () => {
    if (representatives.length < 3) {
      const newRep = createDefaultRepresentative(representatives.length);
      setRepresentatives(prev => [...prev, newRep]);
    }
  };

  const removeRepresentative = (id) => {
    if (representatives.length > 1) {
      setRepresentatives(prev => prev.filter(rep => rep.id !== id));
    }
  };

  const updateRepresentative = (id, field, value) => {
    setRepresentatives(prev => 
      prev.map(rep => 
        rep.id === id ? { ...rep, [field]: value } : rep
      )
    );
  };

  // ฟังก์ชันตรวจสอบ error แต่ละฟิลด์
  const getFieldError = (rep, field, index) => {
    if (representativeErrors[index]?.[field]) {
      return representativeErrors[index][field];
    }

    const value = rep[field];
    if (!value || value.trim() === '') {
      return null;
    }

    if (field === 'firstNameTh' || field === 'lastNameTh') {
      const thaiPattern = /^[ก-๙\s]+$/;
      if (!thaiPattern.test(value)) {
        return 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
      }
    }

    if (field === 'firstNameEn' || field === 'lastNameEn') {
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">ข้อมูลผู้แทนสมาคม</h2>
            <p className="text-blue-100 text-sm mt-1">ข้อมูลผู้มีอำนาจลงนามแทนสมาคม</p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-8">
        {/* Info Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-blue-900 mb-2">การเพิ่มผู้แทนสมาคม</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามแทนสมาคมตามหนังสือรับรอง
              </p>
            </div>
          </div>
        </div>

        {/* Representatives Cards */}
        <div className="space-y-8">
          {representatives.map((rep, index) => (
            <div key={rep.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">ผู้แทนคนที่ {index + 1}</h3>
                      {rep.isPrimary && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          ผู้แทนหลัก
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {representatives.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeRepresentative(rep.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">ลบ</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Thai Name Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ชื่อภาษาไทย</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        ชื่อ <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                      </label>
                      <input
                        type="text"
                        value={rep.firstNameTh}
                        onChange={(e) => updateRepresentative(rep.id, 'firstNameTh', e.target.value)}
                        placeholder="ชื่อภาษาไทย"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          getFieldError(rep, 'firstNameTh', index) ? 
                            'border-red-300 bg-red-50 focus:ring-red-500' : 
                            'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      />
                      {getFieldError(rep, 'firstNameTh', index) && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {getFieldError(rep, 'firstNameTh', index)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={rep.lastNameTh}
                        onChange={(e) => updateRepresentative(rep.id, 'lastNameTh', e.target.value)}
                        placeholder="นามสกุลภาษาไทย"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          getFieldError(rep, 'lastNameTh', index) ? 
                            'border-red-300 bg-red-50 focus:ring-red-500' : 
                            'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      />
                      {getFieldError(rep, 'lastNameTh', index) && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {getFieldError(rep, 'lastNameTh', index)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* English Name Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ชื่อภาษาอังกฤษ</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        ชื่อ <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                      </label>
                      <input
                        type="text"
                        value={rep.firstNameEn}
                        onChange={(e) => updateRepresentative(rep.id, 'firstNameEn', e.target.value)}
                        placeholder="First Name"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          getFieldError(rep, 'firstNameEn', index) ? 
                            'border-red-300 bg-red-50 focus:ring-red-500' : 
                            'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      />
                      {getFieldError(rep, 'firstNameEn', index) && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {getFieldError(rep, 'firstNameEn', index)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={rep.lastNameEn}
                        onChange={(e) => updateRepresentative(rep.id, 'lastNameEn', e.target.value)}
                        placeholder="Last Name"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          getFieldError(rep, 'lastNameEn', index) ? 
                            'border-red-300 bg-red-50 focus:ring-red-500' : 
                            'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      />
                      {getFieldError(rep, 'lastNameEn', index) && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {getFieldError(rep, 'lastNameEn', index)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ข้อมูลติดต่อ</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          ตำแหน่ง
                        </label>
                        <input
                          type="text"
                          value={rep.position}
                          onChange={(e) => updateRepresentative(rep.id, 'position', e.target.value)}
                          placeholder="ประธาน, รองประธาน, เลขานุการ..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          อีเมล <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={rep.email}
                          onChange={(e) => updateRepresentative(rep.id, 'email', e.target.value)}
                          placeholder="example@association.com"
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                            getFieldError(rep, 'email', index) ? 
                              'border-red-300 bg-red-50 focus:ring-red-500' : 
                              'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        />
                        {getFieldError(rep, 'email', index) && (
                          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {getFieldError(rep, 'email', index)}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2">
                            <input
                              type="tel"
                              value={rep.phone}
                              onChange={(e) => updateRepresentative(rep.id, 'phone', e.target.value)}
                              placeholder="02-123-4567"
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                getFieldError(rep, 'phone', index) ? 
                                  'border-red-300 bg-red-50 focus:ring-red-500' : 
                                  'border-gray-300 bg-white hover:border-gray-400'
                              }`}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={rep.phoneExtension || ''}
                              onChange={(e) => updateRepresentative(rep.id, 'phoneExtension', e.target.value)}
                              placeholder="ต่อ (ถ้ามี)"
                              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400"
                            />
                          </div>
                        </div>
                        {getFieldError(rep, 'phone', index) && (
                          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {getFieldError(rep, 'phone', index)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Primary Representative Checkbox */}
                    <div className="mt-6">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rep.isPrimary || false}
                          onChange={(e) => updateRepresentative(rep.id, 'isPrimary', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ผู้แทนหลัก (ใช้สำหรับติดต่อสื่อสาร)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Button */}
        {representatives.length < 3 && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={addRepresentative}
              className="flex items-center gap-3 px-6 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              เพิ่มผู้แทน ({representatives.length}/3)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}