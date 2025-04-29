import MemberSearchField from './MemberSearchField';
import FileUploadField from './FileUploadField';
import { motion } from 'framer-motion';

export default function MemberInfoForm({ 
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  selectedResult,
  setSelectedResult,
  isSubmitting,
  onSubmit,
  showSubmitButton = true
}) {
  
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSelectResult = (result) => {
    console.log('Selected result:', result);
    setSelectedResult(result);
    
    // The member type is already mapped in the API
    const memberTypeValue = result.MEMBER_TYPE || '';
    
    // Create a new form data object with the selected values
    const newFormData = {
      ...formData,
      memberSearch: `${result.MEMBER_CODE} - ${result.COMPANY_NAME}`,
      memberNumber: result.MEMBER_CODE || '',
      companyName: result.COMPANY_NAME || '',
      memberType: memberTypeValue,
      taxId: result.TAX_ID || '',
      documentFile: null
    };
    
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    
    // Clear any errors for the fields that were filled
    setFormErrors(prev => ({
      ...prev,
      memberSearch: false,
      memberNumber: false,
      memberType: false,
      taxId: false,
      documentFile: false
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check which fields are empty
    const errors = {
      memberSearch: !formData.memberSearch,
      memberNumber: !formData.memberNumber,
      memberType: !formData.memberType,
      taxId: !formData.taxId,
      documentFile: !formData.documentFile
    };
    
    // Update error state
    setFormErrors(errors);
    
    // Check if any required field is empty
    if (errors.memberSearch || errors.memberNumber || errors.memberType || errors.taxId || errors.documentFile) {
      return;
    }
    
    // Submit form to parent component
    onSubmit(formData);
  };
  
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.form 
        className="space-y-6" 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MemberSearchField 
          value={formData.memberSearch}
          onChange={handleChange}
          onSelectResult={handleSelectResult}
          hasError={formErrors.memberSearch}
        />
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทสมาชิก
            </label>
            <select 
              name="memberType"
              value={formData.memberType}
              onChange={(e) => handleChange('memberType', e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.memberType ? 'border-red-500' : ''} text-gray-900 bg-gray-100`}
              disabled
            >
              <option value="">-- เลือกประเภทสมาชิก --</option>
              <option value="สส">สามัญ-สมาคมการค้า (สส)</option>
              <option value="สน">สามัญ-โรงงาน (สน)</option>
              <option value="ทน">สมทบ-นิติบุคคล (ทน)</option>
              <option value="ทบ">สมทบ-บุคคลธรรมดา (ทบ)</option>
            </select>
            {formErrors.memberType && (
              <p className="text-red-500 text-xs mt-1">กรุณาเลือกประเภทสมาชิก</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลขประจำตัวผู้เสียภาษี
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.taxId ? 'border-red-500' : ''} text-gray-900 ${selectedResult ? 'bg-gray-100' : ''}`}
              placeholder="เลข 13 หลัก"
              readOnly={!!selectedResult}
            />
            {formErrors.taxId && (
              <p className="text-red-500 text-xs mt-1">กรุณากรอกเลขประจำตัวผู้เสียภาษี</p>
            )}
          </div>
        </motion.div>
        
        {/* File upload field based on member type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FileUploadField 
            label={
              formData.memberType === 'สส' || formData.memberType === 'สน' ? 
                'หนังสือรับรอง (ประทับตราบริษัท และ ลงนาม)' :
              formData.memberType === 'ทน' ? 
                'บัตรอนุญาตสมาคมการค้า (ประทับตราสมาคม และ ลงนาม)' :
              formData.memberType === 'ทบ' ? 
                'สำเนาบัตรประชาชน' :
                'เอกสารยืนยัน'
            }
            name="documentFile"
            value={formData.documentFile}
            onChange={(name, file) => handleChange('documentFile', file)}
            hasError={formErrors.documentFile}
            errorMessage="กรุณาอัพโหลดเอกสารตามที่กำหนด"
            helpText={
              formData.memberType === 'สส' || formData.memberType === 'สน' ? 
                'อัพโหลดหนังสือรับรองที่มีการประทับตราบริษัทและลงนาม (PDF, JPG)' :
              formData.memberType === 'ทน' ? 
                'อัพโหลดบัตรอนุญาตสมาคมการค้าที่มีการประทับตราสมาคมและลงนาม (PDF, JPG)' :
              formData.memberType === 'ทบ' ? 
                'อัพโหลดสำเนาบัตรประชาชนที่ลงนามรับรองสำเนาถูกต้อง (PDF, JPG)' :
                'รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB'
            }
          />
        </motion.div>
        
        {showSubmitButton && (
          <motion.div 
            className="pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังส่งข้อมูล...
                </div>
              ) : 'ส่งข้อมูล'}
            </motion.button>
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
}