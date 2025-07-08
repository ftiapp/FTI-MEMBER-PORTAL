'use client';

/**
 * คอมโพเนนต์สำหรับกรอกข้อมูลผู้ติดต่อในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 */
export default function ContactPersonInfo({ 
  formData, 
  setFormData, 
  errors 
}) {
  // ===============================
  // VALIDATION FUNCTIONS
  // ===============================
  
  const validateThaiOnly = (value) => {
    const thaiPattern = /^[\u0E00-\u0E7F\s]*$/;
    return thaiPattern.test(value);
  };

  const validateEnglishOnly = (value) => {
    const englishPattern = /^[A-Za-z\s]*$/;
    return englishPattern.test(value);
  };

  // ===============================
  // EVENT HANDLERS
  // ===============================
  
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

  const handleThaiInput = (e) => {
    const { name, value } = e.target;
    if (value && !validateThaiOnly(value)) {
      return; // ไม่อัปเดตค่าถ้าไม่ใช่ภาษาไทย
    }
    handleInputChange(e);
  };

  const handleEnglishInput = (e) => {
    const { name, value } = e.target;
    if (value && !validateEnglishOnly(value)) {
      return; // ไม่อัปเดตค่าถ้าไม่ใช่ภาษาอังกฤษ
    }
    handleInputChange(e);
  };

  // ===============================
  // HELPER FUNCTIONS
  // ===============================
  
  const getInputClassName = (fieldName) => {
    const baseClass = `
      w-full px-4 py-3 text-sm
      border rounded-lg
      bg-white
      placeholder-gray-400
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    `;
    
    const errorClass = errors.contactPerson?.[fieldName] 
      ? 'border-red-300 bg-red-50' 
      : 'border-gray-300 hover:border-gray-400';
    
    return `${baseClass} ${errorClass}`;
  };

  const ErrorMessage = ({ fieldName }) => {
    if (!errors.contactPerson?.[fieldName]) return null;
    
    return (
      <p className="text-sm text-red-600 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {errors.contactPerson[fieldName]}
      </p>
    );
  };

  // ===============================
  // RENDER COMPONENTS
  // ===============================
  
  const renderHeader = () => (
    <div className="bg-blue-600 px-8 py-6">
      <h3 className="text-xl font-semibold text-white tracking-tight">
        ข้อมูลผู้ให้ข้อมูล
      </h3>
      <p className="text-blue-100 text-sm mt-1">
        ข้อมูลบุคคลที่ติดต่อได้สำหรับการประสานงาน
      </p>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
        ข้อมูลส่วนตัว
      </h4>
      
      <div className="space-y-6">
        {/* Position - Full width */}
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
            placeholder="ตำแหน่ง"
            className={getInputClassName('position')}
          />
          <ErrorMessage fieldName="position" />
        </div>

        {/* Thai Names - Side by side */}
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
              className={getInputClassName('firstNameThai')}
            />
            <ErrorMessage fieldName="firstNameThai" />
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
              className={getInputClassName('lastNameThai')}
            />
            <ErrorMessage fieldName="lastNameThai" />
          </div>
        </div>

        {/* English Names - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              className={getInputClassName('firstNameEng')}
            />
            <ErrorMessage fieldName="firstNameEng" />
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
              className={getInputClassName('lastNameEng')}
            />
            <ErrorMessage fieldName="lastNameEng" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
        ข้อมูลการติดต่อ
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            className={getInputClassName('email')}
          />
          <ErrorMessage fieldName="email" />
        </div>

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
            placeholder="0xxxxxxxxx"
            maxLength={10}
            className={getInputClassName('phone')}
          />
          <ErrorMessage fieldName="phone" />
        </div>
      </div>
    </div>
  );

  // ===============================
  // MAIN RENDER
  // ===============================
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {renderHeader()}
      
      <div className="px-8 py-8">
        {renderPersonalInfo()}
        {renderContactInfo()}
      </div>
    </div>
  );
}