'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function RepresentativeInfoSection({ formData, setFormData, errors }) {
  const representativeErrors = errors?.representativeErrors || [];
  const isInitialized = useRef(false);
  
  const [representatives, setRepresentatives] = useState([{
    id: `rep_${Date.now()}_0`,
    firstNameThai: '',
    lastNameThai: '',
    firstNameEnglish: '',
    lastNameEnglish: '',
    email: '',
    phone: '',
    isPrimary: true
  }]);

  // โหลดข้อมูลเริ่มต้นเพียงครั้งเดียว
  useEffect(() => {
    if (!isInitialized.current && formData.representatives?.length > 0) {
      setRepresentatives(formData.representatives.map((rep, index) => ({
        ...rep,
        id: rep.id || `rep_${Date.now()}_${index}`
      })));
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
      const newRep = {
        id: `rep_${Date.now()}_${representatives.length}`,
        firstNameThai: '',
        lastNameThai: '',
        firstNameEnglish: '',
        lastNameEnglish: '',
        email: '',
        phone: '',
        isPrimary: false
      };
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white">ข้อมูลผู้แทนนิติบุคคล</h2>
        <p className="text-blue-100 text-sm mt-1">ข้อมูลผู้มีอำนาจลงนามแทนนิติบุคคล</p>
      </div>
      
      <div className="px-8 py-8">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">การเพิ่มผู้แทนนิติบุคคล</p>
              <p className="text-sm text-blue-700 mt-1">สามารถเพิ่มผู้แทนได้สูงสุด 3 ท่าน ควรเป็นผู้มีอำนาจลงนามแทนนิติบุคคลตามหนังสือรับรอง</p>
            </div>
          </div>
        </div>

        {/* Representatives */}
        <div className="space-y-6">
          {representatives.map((rep, index) => (
            <div key={rep.id} className="border border-gray-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h3 className="text-base font-medium text-gray-900">ผู้แทนคนที่ {index + 1}</h3>
                {representatives.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRepresentative(rep.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    ลบ
                  </button>
                )}
              </div>
              
              {/* Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thai First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                  </label>
                  <input
                    type="text"
                    value={rep.firstNameThai}
                    onChange={(e) => updateRepresentative(rep.id, 'firstNameThai', e.target.value)}
                    placeholder="ชื่อภาษาไทย"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.firstNameThai ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.firstNameThai && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].firstNameThai}</p>
                  )}
                </div>

                {/* Thai Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rep.lastNameThai}
                    onChange={(e) => updateRepresentative(rep.id, 'lastNameThai', e.target.value)}
                    placeholder="นามสกุลภาษาไทย"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.lastNameThai ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.lastNameThai && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].lastNameThai}</p>
                  )}
                </div>

                {/* English First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ชื่อ (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
                  </label>
                  <input
                    type="text"
                    value={rep.firstNameEnglish}
                    onChange={(e) => updateRepresentative(rep.id, 'firstNameEnglish', e.target.value)}
                    placeholder="First Name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.firstNameEnglish ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.firstNameEnglish && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].firstNameEnglish}</p>
                  )}
                </div>

                {/* English Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    นามสกุล (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rep.lastNameEnglish}
                    onChange={(e) => updateRepresentative(rep.id, 'lastNameEnglish', e.target.value)}
                    placeholder="Last Name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.lastNameEnglish ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.lastNameEnglish && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].lastNameEnglish}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={rep.email}
                    onChange={(e) => updateRepresentative(rep.id, 'email', e.target.value)}
                    placeholder="example@company.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.email && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={rep.phone}
                    onChange={(e) => updateRepresentative(rep.id, 'phone', e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      representativeErrors[index]?.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {representativeErrors[index]?.phone && (
                    <p className="text-sm text-red-600 mt-1">{representativeErrors[index].phone}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Button */}
        {representatives.length < 3 && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={addRepresentative}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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