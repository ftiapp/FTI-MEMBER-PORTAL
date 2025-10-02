import { PDFDocument } from "pdf-lib";
import imageCompression from "browser-image-compression";

// ค่า config สำหรับ Cloudinary
const CLOUDINARY_CLOUD_NAME = "your-cloud-name"; // เปลี่ยนเป็น cloud name ของคุณ
const CLOUDINARY_UPLOAD_PRESET = "fti_direct_upload"; // เปลี่ยนเป็น upload preset ที่คุณสร้าง

/**
 * บีบอัดไฟล์ PDF ในเบราว์เซอร์ก่อนอัปโหลด
 * @param {File} pdfFile - ไฟล์ PDF ต้นฉบับ
 * @param {Object} options - ตัวเลือกการบีบอัด
 * @returns {Promise<File>} - ไฟล์ PDF ที่บีบอัดแล้ว
 */
export async function compressPDF(pdfFile, options = { quality: "medium" }) {
  try {
    // อ่านไฟล์เป็น ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();

    // โหลดเอกสาร PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // ตั้งค่าคุณภาพการบีบอัด
    let compressionLevel;
    switch (options.quality) {
      case "high":
        compressionLevel = { useObjectStreams: true };
        break;
      case "low":
        compressionLevel = {
          useObjectStreams: true,
          addCompression: true,
          objectCompressionLevel: 9,
        };
        break;
      case "medium":
      default:
        compressionLevel = {
          useObjectStreams: true,
          addCompression: true,
          objectCompressionLevel: 6,
        };
        break;
    }

    // บีบอัด PDF
    const compressedPdfBytes = await pdfDoc.save(compressionLevel);

    // สร้างไฟล์ใหม่จากข้อมูลที่บีบอัดแล้ว
    const compressedFile = new File(
      [compressedPdfBytes],
      pdfFile.name.replace(".pdf", ".compressed.pdf"),
      { type: "application/pdf" },
    );

    console.log(
      `PDF compressed: ${pdfFile.size} -> ${compressedFile.size} bytes (${Math.round((compressedFile.size / pdfFile.size) * 100)}%)`,
    );

    return compressedFile;
  } catch (error) {
    console.error("PDF compression failed:", error);
    // หากบีบอัดไม่สำเร็จ ส่งคืนไฟล์ต้นฉบับ
    return pdfFile;
  }
}

/**
 * บีบอัดไฟล์รูปภาพในเบราว์เซอร์ก่อนอัปโหลด
 * @param {File} imageFile - ไฟล์รูปภาพต้นฉบับ
 * @returns {Promise<File>} - ไฟล์รูปภาพที่บีบอัดแล้ว
 */
export async function compressImage(imageFile) {
  try {
    const options = {
      maxSizeMB: 1, // ขนาดไฟล์สูงสุดหลังบีบอัด
      maxWidthOrHeight: 1920, // ความกว้างหรือความสูงสูงสุด
      useWebWorker: true, // ใช้ Web Worker เพื่อไม่ให้ freeze UI
      initialQuality: 0.8, // คุณภาพเริ่มต้น (0-1)
    };

    const compressedFile = await imageCompression(imageFile, options);

    console.log(
      `Image compressed: ${imageFile.size} -> ${compressedFile.size} bytes (${Math.round((compressedFile.size / imageFile.size) * 100)}%)`,
    );

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // หากบีบอัดไม่สำเร็จ ส่งคืนไฟล์ต้นฉบับ
    return imageFile;
  }
}

/**
 * บีบอัดไฟล์ก่อนอัปโหลดตามประเภทไฟล์
 * @param {File} file - ไฟล์ต้นฉบับ
 * @returns {Promise<File>} - ไฟล์ที่บีบอัดแล้ว
 */
export async function compressFile(file) {
  const fileType = file.type.toLowerCase();

  if (fileType === "application/pdf") {
    return compressPDF(file);
  } else if (fileType.startsWith("image/")) {
    return compressImage(file);
  }

  // ไม่รองรับการบีบอัดประเภทไฟล์นี้ ส่งคืนไฟล์ต้นฉบับ
  return file;
}

/**
 * อัปโหลดไฟล์ตรงไปยัง Cloudinary
 * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
 * @param {string} folder - โฟลเดอร์ปลายทางใน Cloudinary
 * @returns {Promise<Object>} - ผลลัพธ์การอัปโหลด
 */
export async function directUploadToCloudinary(file, folder = "address_documents") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (error) {
    console.error("Direct upload error:", error);
    return {
      success: false,
      error: error.message,
      fileName: file.name,
    };
  }
}

/**
 * อัปโหลดไฟล์หลายไฟล์พร้อมจำกัดจำนวนการอัปโหลดพร้อมกัน
 * @param {File[]} files - อาร์เรย์ของไฟล์ที่ต้องการอัปโหลด
 * @param {string} folder - โฟลเดอร์ปลายทางใน Cloudinary
 * @param {number} maxConcurrent - จำนวนไฟล์สูงสุดที่อัปโหลดพร้อมกัน
 * @param {Function} onProgress - callback สำหรับรายงานความคืบหน้า
 * @returns {Promise<Object[]>} - อาร์เรย์ของผลลัพธ์การอัปโหลด
 */
export async function uploadFilesWithConcurrencyLimit(
  files,
  folder = "address_documents",
  maxConcurrent = 2,
  onProgress = null,
) {
  const results = [];
  const queue = [...files];
  const total = files.length;
  let completed = 0;

  // ฟังก์ชันสำหรับประมวลผลคิว
  async function processQueue() {
    if (queue.length === 0) return;

    const file = queue.shift();
    try {
      // บีบอัดไฟล์ก่อนอัปโหลด
      const compressedFile = await compressFile(file);

      // อัปโหลดไฟล์ที่บีบอัดแล้วตรงไปยัง Cloudinary
      const result = await directUploadToCloudinary(compressedFile, folder);

      results.push(result);
      completed++;

      // รายงานความคืบหน้า
      if (onProgress) {
        onProgress({
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
          currentFile: file.name,
          success: result.success,
        });
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      results.push({
        success: false,
        error: error.message,
        fileName: file.name,
      });

      completed++;
      if (onProgress) {
        onProgress({
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
          currentFile: file.name,
          success: false,
        });
      }
    }

    // ประมวลผลไฟล์ถัดไปในคิว
    await processQueue();
  }

  // เริ่มประมวลผลพร้อมกันตามจำนวนที่กำหนด
  const workers = [];
  for (let i = 0; i < Math.min(maxConcurrent, files.length); i++) {
    workers.push(processQueue());
  }

  // รอให้ทุกงานเสร็จสิ้น
  await Promise.all(workers);
  return results;
}

/**
 * บันทึกข้อมูลไฟล์ที่อัปโหลดลงในฐานข้อมูล
 * @param {Object} fileData - ข้อมูลไฟล์ที่อัปโหลดแล้ว
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} documentType - ประเภทของเอกสาร
 * @returns {Promise<Object>} - ผลลัพธ์การบันทึกข้อมูล
 */
export async function saveFileToDatabase(fileData, userId, documentType) {
  try {
    const response = await fetch("/api/save-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: fileData.url,
        public_id: fileData.public_id,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        userId,
        documentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save document: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving file to database:", error);
    return { success: false, error: error.message };
  }
}
