export default function SearchStatus({ 
    isSearching,
    fieldValue,
    fieldType = 'subdistrict',
    minLength = 2,
    apiReady,
    isComplete,
    hasPartialData,
    showNoResults = false
  }) {
    const currentLength = fieldValue ? fieldValue.length : 0;
    const isSubdistrict = fieldType === 'subdistrict';
    const fieldName = isSubdistrict ? 'ตำบล' : 'รหัสไปรษณีย์';
    const clearFields = isSubdistrict ? 'อำเภอ/จังหวัด' : 'ตำบล/อำเภอ/จังหวัด';
  
    // แสดงสถานะการค้นหา
    if (isSearching) {
      return (
        <div className="mt-1 text-sm text-blue-600 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังค้นหา...
        </div>
      );
    }
  
    // แสดงข้อความเมื่อพิมพ์ไม่ครบตัวอักษร/ตัวเลข
    if (!isSearching && fieldValue && currentLength >= 1 && currentLength < minLength) {
      return (
        <div className="mt-1 text-sm text-amber-600">
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            พิมพ์อีก {minLength - currentLength} {isSubdistrict ? 'ตัวอักษร' : 'ตัวเลข'}เพื่อเริ่มค้นหา (ข้อมูล{clearFields}จะถูกเคลียร์)
          </span>
        </div>
      );
    }
  
    // แสดงข้อความเมื่อข้อมูลครบถ้วน
    if (isComplete) {
      return (
        <div className="mt-1 text-sm text-green-700 bg-green-50 px-2 py-1 rounded flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ข้อมูลที่อยู่ครบถ้วนแล้ว
        </div>
      );
    }
  
    // แสดงข้อความเมื่อไม่มีผลลัพธ์
    if (showNoResults && 
        !isSearching && 
        fieldValue && 
        currentLength >= minLength && 
        apiReady && 
        !hasPartialData) {
      return (
        <div className="mt-1 text-sm text-gray-500">
          ไม่พบ{fieldName} "{fieldValue}" ลองตรวจสอบการพิมพ์
        </div>
      );
    }
  
    return null;
  }