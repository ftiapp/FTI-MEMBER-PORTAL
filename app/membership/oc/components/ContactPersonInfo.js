'use client';

export default function ContactPersonInfo({ 
  formData, 
  setFormData, 
  errors 
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateThaiOnly = (value) => {
    const thaiPattern = /^[\u0E00-\u0E7F\s]*$/;
    return thaiPattern.test(value);
  };

  const handleThaiInput = (e) => {
    if (e.target.value && !validateThaiOnly(e.target.value)) {
      return;
    }
    handleInputChange(e);
  };

  const validateEnglishOnly = (value) => {
    const englishPattern = /^[A-Za-z\s]*$/;
    return englishPattern.test(value);
  };

  const handleEnglishInput = (e) => {
    if (e.target.value && !validateEnglishOnly(e.target.value)) {
      return;
    }
    handleInputChange(e);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้ให้ข้อมูล
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลบุคคลที่ติดต่อได้สำหรับการประสานงาน
        </p>
      </div>
      
      <div className="px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลส่วนตัว
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Name (Thai) */}
            <div className="space-y-2">
              <label htmlFor="contactPersonFirstName" className="block text-sm font-medium text-gray-900">
                ชื่อจริง (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="contactPersonFirstName"
                name="contactPersonFirstName"
                value={formData.contactPersonFirstName || ''}
                onChange={handleThaiInput}
                required
                placeholder="ระบุชื่อจริง"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonFirstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonFirstName && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonFirstName}
                </p>
              )}
            </div>

            {/* Last Name (Thai) */}
            <div className="space-y-2">
              <label htmlFor="contactPersonLastName" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="contactPersonLastName"
                name="contactPersonLastName"
                value={formData.contactPersonLastName || ''}
                onChange={handleThaiInput}
                required
                placeholder="ระบุนามสกุล"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonLastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonLastName && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonLastName}
                </p>
              )}
            </div>

            {/* First Name (English) */}
            <div className="space-y-2">
              <label htmlFor="contactPersonFirstNameEng" className="block text-sm font-medium text-gray-900">
                ชื่อ (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="contactPersonFirstNameEng"
                name="contactPersonFirstNameEng"
                value={formData.contactPersonFirstNameEng || ''}
                onChange={handleEnglishInput}
                required
                placeholder="First Name"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonFirstNameEng ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonFirstNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonFirstNameEng}
                </p>
              )}
            </div>

            {/* Last Name (English) */}
            <div className="space-y-2">
              <label htmlFor="contactPersonLastNameEng" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="contactPersonLastNameEng"
                name="contactPersonLastNameEng"
                value={formData.contactPersonLastNameEng || ''}
                onChange={handleEnglishInput}
                required
                placeholder="Last Name"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonLastNameEng ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonLastNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonLastNameEng}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="contactPersonPosition" className="block text-sm font-medium text-gray-900">
                ตำแหน่ง
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="contactPersonPosition"
                name="contactPersonPosition"
                value={formData.contactPersonPosition || ''}
                onChange={handleInputChange}
                required
                placeholder="ระบุตำแหน่ง"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonPosition ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonPosition && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonPosition}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลการติดต่อ
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-900">
                เบอร์โทรศัพท์
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                id="contactPersonPhone"
                name="contactPersonPhone"
                value={formData.contactPersonPhone || ''}
                onChange={handleInputChange}
                required
                placeholder="0812345678"
                maxLength={10}
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonPhone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonPhone && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonPhone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-900">
                อีเมล
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="contactPersonEmail"
                name="contactPersonEmail"
                value={formData.contactPersonEmail || ''}
                onChange={handleInputChange}
                required
                placeholder="example@mail.com"
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactPersonEmail ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.contactPersonEmail && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.contactPersonEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}