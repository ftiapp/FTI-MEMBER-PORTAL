'use client';

export default function ContactPersonInfo({ 
  formData, 
  setFormData, 
  errors 
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      contactPerson: {
        ...prev.contactPerson || {},
        [name]: value
      }
    }));
  };

  // ตรวจสอบว่าอินพุตเป็นภาษาไทยเท่านั้น
  const validateThaiOnly = (value) => {
    const thaiPattern = /^[\u0E00-\u0E7F\s]*$/;
    return thaiPattern.test(value);
  };

  // ตรวจสอบว่าอินพุตเป็นภาษาอังกฤษเท่านั้น
  const validateEnglishOnly = (value) => {
    const englishPattern = /^[A-Za-z\s]*$/;
    return englishPattern.test(value);
  };

  // ตรวจสอบการกรอกข้อมูลภาษาไทย
  const handleThaiInput = (e) => {
    const { name, value } = e.target;
    if (value && !validateThaiOnly(value)) {
      return; // ไม่อัปเดตค่าถ้าไม่ใช่ภาษาไทย
    }
    handleInputChange(e);
  };

  // ตรวจสอบการกรอกข้อมูลภาษาอังกฤษ
  const handleEnglishInput = (e) => {
    const { name, value } = e.target;
    if (value && !validateEnglishOnly(value)) {
      return; // ไม่อัปเดตค่าถ้าไม่ใช่ภาษาอังกฤษ
    }
    handleInputChange(e);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้ให้ข้อมูล
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลบุคคลที่ติดต่อได้สำหรับการประสานงาน
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8">
        {/* Personal Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลส่วนตัว
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Name (Thai) */}
            <div className="space-y-2">
              <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-900">
                ชื่อ (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="firstNameThai"
                name="firstNameThai"
                value={formData.contactPerson?.firstNameThai || ''}
                onChange={handleThaiInput}
                required
                placeholder="ชื่อภาษาไทย"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.firstNameThai 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.firstNameThai && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.firstNameThai === 'object' ? 
                    (Object.values(errors.contactPerson.firstNameThai)[0] || 'กรุณากรอกชื่อภาษาไทย') : 
                    errors.contactPerson.firstNameThai}
                </p>
              )}
            </div>

            {/* Last Name (Thai) */}
            <div className="space-y-2">
              <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="lastNameThai"
                name="lastNameThai"
                value={formData.contactPerson?.lastNameThai || ''}
                onChange={handleThaiInput}
                required
                placeholder="นามสกุลภาษาไทย"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.lastNameThai 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.lastNameThai && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.lastNameThai === 'object' ? 
                    (Object.values(errors.contactPerson.lastNameThai)[0] || 'กรุณากรอกนามสกุลภาษาไทย') : 
                    errors.contactPerson.lastNameThai}
                </p>
              )}
            </div>
            
            {/* First Name (English) */}
            <div className="space-y-2">
              <label htmlFor="firstNameEng" className="block text-sm font-medium text-gray-900">
                ชื่อ (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="firstNameEng"
                name="firstNameEng"
                value={formData.contactPerson?.firstNameEng || ''}
                onChange={handleEnglishInput}
                required
                placeholder="First Name"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.firstNameEng 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.firstNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.firstNameEng === 'object' ? 
                    (Object.values(errors.contactPerson.firstNameEng)[0] || 'กรุณากรอกชื่อภาษาอังกฤษ') : 
                    errors.contactPerson.firstNameEng}
                </p>
              )}
            </div>
            
            {/* Last Name (English) */}
            <div className="space-y-2">
              <label htmlFor="lastNameEng" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="lastNameEng"
                name="lastNameEng"
                value={formData.contactPerson?.lastNameEng || ''}
                onChange={handleEnglishInput}
                required
                placeholder="Last Name"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.lastNameEng 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.lastNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.lastNameEng === 'object' ? 
                    (Object.values(errors.contactPerson.lastNameEng)[0] || 'กรุณากรอกนามสกุลภาษาอังกฤษ') : 
                    errors.contactPerson.lastNameEng}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="position" className="block text-sm font-medium text-gray-900">
                ตำแหน่ง
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.contactPerson?.position || ''}
                onChange={handleInputChange}
                required
                placeholder="ตำแหน่งในบริษัท"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.position 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.position && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.position === 'object' ? 
                    (Object.values(errors.contactPerson.position)[0] || 'กรุณากรอกตำแหน่ง') : 
                    errors.contactPerson.position}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลการติดต่อ
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                เบอร์โทรศัพท์
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.contactPerson?.phone || ''}
                onChange={handleInputChange}
                required
                placeholder="08X-XXX-XXXX"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.phone 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.phone && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.phone === 'object' ? 
                    (Object.values(errors.contactPerson.phone)[0] || 'กรุณากรอกเบอร์โทรศัพท์') : 
                    errors.contactPerson.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                อีเมล
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.contactPerson?.email || ''}
                onChange={handleInputChange}
                required
                placeholder="example@company.com"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.contactPerson?.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors.contactPerson?.email && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {typeof errors.contactPerson.email === 'object' ? 
                    (Object.values(errors.contactPerson.email)[0] || 'กรุณากรอกอีเมล') : 
                    errors.contactPerson.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}