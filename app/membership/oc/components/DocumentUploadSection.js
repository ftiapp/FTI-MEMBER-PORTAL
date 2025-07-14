import { useState, useEffect } from 'react';
import FactoryTypeSelector from './FactoryTypeSelector';
import MultipleFileManager from './MultipleFileManager';

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้น
  const [selectedFiles, setSelectedFiles] = useState({
    factoryLicense: formData.factoryLicense || null,
    industrialEstateLicense: formData.industrialEstateLicense || null,
    productionImages: formData.productionImages || []
  });

  const [factoryType, setFactoryType] = useState(formData.factoryType || '');

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      factoryLicense: formData.factoryLicense || null,
      industrialEstateLicense: formData.industrialEstateLicense || null,
      productionImages: formData.productionImages || []
    });
    setFactoryType(formData.factoryType || '');
  }, [formData]);

  // Helper function to create consistent file object
  const createFileObject = (file) => {
    return {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  };

  const handleFactoryTypeChange = (type) => {
    setFactoryType(type);
    setFormData(prev => ({
      ...prev,
      factoryType: type,
      // Clear opposite type files when switching
      factoryLicense: type === 'type1' ? prev.factoryLicense : null,
      industrialEstateLicense: type === 'type1' ? prev.industrialEstateLicense : null,
      productionImages: type === 'type2' ? prev.productionImages : []
    }));
    
    setSelectedFiles(prev => ({
      ...prev,
      factoryLicense: type === 'type1' ? prev.factoryLicense : null,
      industrialEstateLicense: type === 'type1' ? prev.industrialEstateLicense : null,
      productionImages: type === 'type2' ? prev.productionImages : []
    }));
  };

  const viewFile = (fileObj) => {
    if (fileObj) {
      const file = fileObj.file || fileObj;
      if (file && file.type && file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        const w = window.open('');
        w.document.write(img.outerHTML);
      } else if (file) {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      }
    }
  };

  // Helper function to check if file exists
  const hasFile = (fileObj) => {
    return fileObj && (fileObj.file || fileObj.name);
  };

  // Helper function to get file name
  const getFileName = (fileObj) => {
    if (!fileObj) return '';
    return fileObj.name || (fileObj.file && fileObj.file.name) || 'ไฟล์ที่อัปโหลด';
  };

  // Helper function to get file size
  const getFileSize = (fileObj) => {
    if (!fileObj) return '';
    const size = fileObj.size || (fileObj.file && fileObj.file.size);
    return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  // Single file upload component
  const SingleFileUploadZone = ({ title, description, name, file, icon, iconColor, bgColor }) => {
    const handleSingleFileChange = (e) => {
      const { files } = e.target;
      if (files && files[0]) {
        const fileObj = createFileObject(files[0]);
        setSelectedFiles(prev => ({ ...prev, [name]: fileObj }));
        setFormData(prev => ({ ...prev, [name]: fileObj }));
      }
    };

    const removeSingleFile = () => {
      setSelectedFiles(prev => ({ ...prev, [name]: null }));
      setFormData(prev => ({ ...prev, [name]: null }));
    };

    return (
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Upload Area */}
          {!hasFile(file) && (
            <div className="relative">
              <input
                type="file"
                name={name}
                onChange={handleSingleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-2">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                <p className="text-xs text-gray-500">รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 10MB)</p>
              </div>
            </div>
          )}

          {/* File Preview */}
          {hasFile(file) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{getFileName(file)}</p>
                    <p className="text-xs text-gray-500">{getFileSize(file)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => viewFile(file)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="ดูไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={removeSingleFile}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Multiple file upload for production images
  const handleMultipleFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => createFileObject(file));
      const currentFiles = selectedFiles.productionImages || [];
      const totalFiles = [...currentFiles, ...newFiles].slice(0, 5);
      
      setSelectedFiles(prev => ({ ...prev, productionImages: totalFiles }));
      setFormData(prev => ({ ...prev, productionImages: totalFiles }));
    }
  };

  const removeProductionImage = (index) => {
    const updatedFiles = selectedFiles.productionImages.filter((_, i) => i !== index);
    setSelectedFiles(prev => ({ ...prev, productionImages: updatedFiles }));
    setFormData(prev => ({ ...prev, productionImages: updatedFiles }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          เอกสารใบอนุญาต
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          เลือกประเภทโรงงานและอัปโหลดเอกสารประกอบ
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Factory Type Selection */}
        <FactoryTypeSelector 
          factoryType={factoryType} 
          onChange={handleFactoryTypeChange} 
        />

        {/* Document Upload Section */}
        {factoryType && (
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            {/* Type 1 Documents */}
            {factoryType === 'type1' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      อัปโหลดเอกสารใบอนุญาต
                    </span>
                  </div>
                </div>

                {/* Factory License Upload */}
                <SingleFileUploadZone
                  title="ใบอนุญาตประกอบกิจการโรงงาน"
                  description="รง.4 - เอกสารใบอนุญาตประกอบกิจการโรงงานที่ออกโดยกรมโรงงานอุตสาหกรรม"
                  name="factoryLicense"
                  file={selectedFiles.factoryLicense}
                  icon={
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  iconColor="text-blue-600"
                  bgColor="bg-blue-100"
                />

                {/* Industrial Estate License Upload */}
                <SingleFileUploadZone
                  title="ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม"
                  description="กนอ. - เอกสารใบอนุญาตที่ออกโดยการนิคมอุตสาหกรรมแห่งประเทศไทย"
                  name="industrialEstateLicense"
                  file={selectedFiles.industrialEstateLicense}
                  icon={
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  iconColor="text-green-600"
                  bgColor="bg-green-100"
                />
              </div>
            )}

            {/* Type 2 Documents */}
            {factoryType === 'type2' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      อัปโหลดรูปภาพหรือเอกสาร (ไม่เกิน 5 ไฟล์)
                    </span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        เอกสารการผลิต
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        รูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต และสถานที่ผลิต หรือ เอกสารที่ออกโดยหน่วยงานภาครัฐที่แสดงถึงการผลิต
                      </p>
                    </div>

                    <MultipleFileManager
                      files={selectedFiles.productionImages}
                      onUpload={handleMultipleFileChange}
                      onView={viewFile}
                      onRemove={removeProductionImage}
                      maxFiles={5}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!factoryType && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              เลือกประเภทโรงงาน
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              กรุณาเลือกประเภทโรงงานด้านบนเพื่อดำเนินการอัปโหลดเอกสาร
            </p>
          </div>
        )}
      </div>
    </div>
  );
}