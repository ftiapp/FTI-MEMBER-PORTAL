/**
 * Shared file utility functions for document upload components
 */

/**
 * Creates a consistent file object with metadata
 * @param {File} file - The file object
 * @returns {Object} File object with metadata
 */
export const createFileObject = (file) => {
  return {
    file: file,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
};

/**
 * Checks if a file object exists and has content
 * @param {Object|File|null} fileObj - File object or File instance
 * @returns {boolean} True if file exists
 */
export const hasFile = (fileObj) => {
  if (!fileObj) return false;
  
  // Handle File objects directly
  if (fileObj instanceof File) {
    return true;
  }
  
  // Handle wrapped file objects
  return !!(fileObj.file || fileObj.name || fileObj.url);
};

/**
 * Gets the display name of a file
 * @param {Object|File|null} fileObj - File object or File instance
 * @returns {string} File name
 */
export const getFileName = (fileObj) => {
  if (!fileObj) return "";
  
  // Handle File objects directly
  if (fileObj instanceof File) {
    return fileObj.name;
  }
  
  // Handle wrapped file objects
  if (fileObj.name) {
    return fileObj.name;
  }
  
  if (fileObj.file && fileObj.file.name) {
    return fileObj.file.name;
  }
  
  // Handle URL strings
  if (typeof fileObj === "string") {
    try {
      return decodeURIComponent(fileObj.split("/").pop().split("?")[0]);
    } catch (e) {
      return "ไฟล์ที่อัปโหลด";
    }
  }
  
  return "ไฟล์ที่อัปโหลด";
};

/**
 * Gets the formatted file size
 * @param {Object|File|null} fileObj - File object or File instance
 * @returns {string} Formatted file size
 */
export const getFileSize = (fileObj) => {
  if (!fileObj) return "";
  
  let size;
  
  // Handle File objects directly
  if (fileObj instanceof File) {
    size = fileObj.size;
  } else {
    // Handle wrapped file objects
    size = fileObj.size || (fileObj.file && fileObj.file.size);
  }
  
  if (!size) return "ไฟล์ถูกอัปโหลดแล้ว";
  
  if (size === 0) return "0 B";
  
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${["B", "KB", "MB", "GB", "TB"][i]}`;
};

/**
 * Opens a file for viewing in a new tab
 * @param {Object|File|string} fileOrUrl - File object, wrapped file, or URL string
 */
export const viewFile = (fileOrUrl) => {
  if (!fileOrUrl) return;

  // Handle string URLs directly
  if (typeof fileOrUrl === "string") {
    window.open(fileOrUrl, "_blank");
    return;
  }

  // Handle file objects that might have a URL (from rejection data)
  if (fileOrUrl.url && typeof fileOrUrl.url === "string") {
    window.open(fileOrUrl.url, "_blank");
    return;
  }

  // Handle local File objects
  const file = fileOrUrl.file || fileOrUrl;
  if (file instanceof File) {
    const url = URL.createObjectURL(file);
    if (file.type?.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        // Revoke after load to free memory
        URL.revokeObjectURL(url);
      };
      img.src = url;
      const w = window.open("");
      if (w && w.document) {
        w.document.write(
          `<body style="margin:0; background:#222;"><img src="${url}" style="width:100%; height:auto; max-width:100vw; max-height:100vh; object-fit:contain; margin:auto; display:block;"></body>`
        );
      }
    } else {
      window.open(url, "_blank");
      // Revoke shortly after opening
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    return;
  }

  // Fallback: cannot determine URL
  alert("ไม่สามารถแสดงตัวอย่างไฟล์ได้");
};

/**
 * Validates file size against maximum allowed size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum size in MB (default: 5)
 * @returns {boolean} True if file size is valid
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validates file type based on allowed types
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is valid
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Gets image editor title based on document type
 * @param {string} type - Document type
 * @returns {string} Editor title
 */
export const getImageEditorTitle = (type) => {
  switch (type) {
    case "companyStamp":
      return "ปรับแต่งตราประทับบริษัท";
    case "authorizedSignature":
      return "ปรับแต่งลายเซ็นผู้มีอำนาจลงนาม";
    case "associationStamp":
      return "ปรับแต่งตราประทับสมาคม";
    default:
      return "ปรับแต่งรูปภาพ";
  }
};
