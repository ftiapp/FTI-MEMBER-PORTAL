'use client';

export default function FileUploader({
  documentType,
  documentFile,
  onDocumentTypeChange,
  onFileChange,
  error,
}) {
  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทเอกสาร
        </label>
        <select
          name="documentType"
          value={documentType}
          onChange={onDocumentTypeChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="company_registration">หนังสือรับรองบริษัท</option>
          <option value="tax_registration">ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)</option>
          <option value="other">เอกสารอื่นๆ</option>
        </select>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          อัปโหลดเอกสาร
        </label>
        <div className={`border-2 border-dashed rounded-lg p-4 ${error ? 'border-red-500' : 'border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500 mb-1">คลิกหรือลากไฟล์มาวางที่นี่</p>
            <p className="text-xs text-gray-400">รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 10MB)</p>
            
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onFileChange}
            />
            
            <button
              type="button"
              onClick={() => document.getElementById('file-upload').click()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เลือกไฟล์
            </button>
          </div>
          
          {documentFile && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm truncate max-w-xs">{documentFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFileChange({ target: { files: [] } });
                  document.getElementById('file-upload').value = '';
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {error && (
            <p className="text-red-500 text-xs mt-1">กรุณาอัปโหลดเอกสาร</p>
          )}
        </div>
      </div>
    </div>
  );
}
