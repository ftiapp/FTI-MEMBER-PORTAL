/**
 * Validates file size and type
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB
 * @param {Array<string>} options.allowedTypes - Array of allowed MIME types
 * @returns {Object} - Validation result {isValid, error}
 */
export const validateFile = (file, options = {}) => {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;
  
  if (!file) {
    return { isValid: false, error: 'ไม่พบไฟล์' };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB} MB` };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map(type => {
      if (type === 'image/jpeg') return 'JPEG';
      if (type === 'image/png') return 'PNG';
      if (type === 'application/pdf') return 'PDF';
      return type;
    }).join(', ');
    
    return { isValid: false, error: `ประเภทไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ ${typeNames}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Converts file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
