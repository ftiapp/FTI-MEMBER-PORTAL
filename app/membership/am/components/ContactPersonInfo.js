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
          
          <div className="space-y-6">
            {/* Position - First */}
            <div className="space-y-2">
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
                placeholder="ตำแหน่งในสมาคม"
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
                  {errors.contactPerson.position}
                </p>
              )}
            </div>

            {/* First Name and Last Name - Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
                  ชื่อ
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.contactPerson?.firstName || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="ชื่อ"
                  className={`
                    w-full px-4 py-3 text-sm
                    border rounded-lg
                    bg-white
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.contactPerson?.firstName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                />
                {errors.contactPerson?.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.contactPerson.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">
                  นามสกุล
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.contactPerson?.lastName || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="นามสกุล"
                  className={`
                    w-full px-4 py-3 text-sm
                    border rounded-lg
                    bg-white
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.contactPerson?.lastName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                />
                {errors.contactPerson?.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.contactPerson.lastName}
                  </p>
                )}
              </div>
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
                  {errors.contactPerson.phone}
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
                placeholder="example@association.com"
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
                  {errors.contactPerson.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}