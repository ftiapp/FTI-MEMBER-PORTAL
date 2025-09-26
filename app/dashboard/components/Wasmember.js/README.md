# การปรับปรุงประสิทธิภาพการอัปโหลดไฟล์ PDF

ระบบนี้ช่วยเพิ่มประสิทธิภาพการอัปโหลดไฟล์ PDF และรูปภาพสำหรับ FTI Portal โดยใช้เทคนิค:
1. บีบอัดไฟล์ PDF และรูปภาพก่อนอัปโหลด
2. อัปโหลดตรงจากเบราว์เซอร์ไป Cloudinary (ไม่ผ่านเซิร์ฟเวอร์)
3. จำกัดการอัปโหลดพร้อมกันเพื่อความเสถียร

## วิธีการตั้งค่า Cloudinary Upload Preset

### 1. เข้าสู่ระบบ Cloudinary Dashboard

1. เข้าไปที่ [Cloudinary Dashboard](https://cloudinary.com/console)
2. ล็อกอินด้วยบัญชีที่ใช้กับโปรเจค FTI Portal

### 2. สร้าง Upload Preset แบบ Unsigned

1. ไปที่เมนู **Settings** > **Upload** (ด้านซ้าย)
2. เลื่อนลงไปที่ส่วน **Upload presets**
3. คลิกปุ่ม **Add upload preset**
4. ตั้งค่าดังนี้:
   - **Preset name**: `fti_direct_upload` (หรือชื่ออื่นตามต้องการ)
   - **Signing Mode**: เลือก `Unsigned` (สำคัญมาก)
   - **Folder**: `member_verification` (หรือโฟลเดอร์ที่ต้องการ)
   - **Overwrite**: เลือก `true` ถ้าต้องการให้ไฟล์ใหม่แทนที่ไฟล์เก่าที่มีชื่อเดียวกัน
   - **Unique filename**: เลือก `true` เพื่อป้องกันชื่อไฟล์ซ้ำ

### 3. ตั้งค่าการจำกัดประเภทไฟล์และขนาด

1. ในหน้าเดียวกัน ให้เลื่อนลงไปที่ส่วน **Media analysis and AI**
2. ตั้งค่า **Format** เป็น `pdf,jpg,jpeg,png` เพื่อจำกัดประเภทไฟล์
3. ตั้งค่า **Max file size** เป็น `5MB` หรือตามที่ต้องการ

### 4. ตั้งค่าการแปลงไฟล์ (Transformation)

1. เลื่อนลงไปที่ส่วน **Incoming Transformations**
2. สำหรับรูปภาพ คุณสามารถตั้งค่า transformation เพื่อลดขนาดไฟล์ได้ เช่น:
   - `q_auto` (คุณภาพอัตโนมัติ)
   - `f_auto` (รูปแบบไฟล์อัตโนมัติ)
   - `w_1920` (จำกัดความกว้างสูงสุด)

### 5. บันทึกการตั้งค่า

1. คลิกปุ่ม **Save** ที่ด้านล่างของหน้า
2. จดชื่อ preset ที่สร้าง (`fti_direct_upload`) และ cloud name ของคุณไว้

### 6. อัปเดตไฟล์ optimizedUpload.js

1. เปิดไฟล์ `app/utils/optimizedUpload.js`
2. แก้ไขค่า config ด้านบนของไฟล์:

```javascript
// ค่า config สำหรับ Cloudinary
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // เปลี่ยนเป็น cloud name ของคุณ
const CLOUDINARY_UPLOAD_PRESET = 'fti_direct_upload'; // เปลี่ยนเป็น upload preset ที่คุณสร้าง
```

## วิธีการใช้งาน

### 1. ใช้ OptimizedFileUploader Component

```jsx
import OptimizedFileUploader from '@/app/components/OptimizedFileUploader';

// ภายในคอมโพเนนต์ของคุณ
<OptimizedFileUploader
  userId={user?.id}
  documentType="member_verification"
  folder="member_verification"
  maxConcurrent={2}
  acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
  maxFileSize={5}
  onUploadComplete={handleUploadComplete}
/>
```

### 2. ใช้ฟังก์ชัน uploadFilesWithConcurrencyLimit โดยตรง

```jsx
import { uploadFilesWithConcurrencyLimit } from '@/app/utils/optimizedUpload';

// ภายในฟังก์ชันของคุณ
const handleFileUpload = async (files) => {
  const results = await uploadFilesWithConcurrencyLimit(
    files,
    'member_verification',
    2, // maxConcurrent
    (progress) => {
      // แสดงความคืบหน้า
      console.log(`${progress.percentage}% - ${progress.currentFile}`);
    }
  );
  
  // จัดการผลลัพธ์
  console.log('Upload results:', results);
};
```

### 3. ตัวอย่างการใช้งานในหน้า Wasmember

ดูตัวอย่างการใช้งานได้ที่:
- `app/dashboard/components/Wasmember.js/components/OptimizedUploadExample.jsx`
- `app/dashboard/components/Wasmember.js/components/OptimizedMemberInfoForm.jsx`

## ข้อแนะนำเพิ่มเติม

1. **ขนาดไฟล์**: ถ้าไฟล์ PDF ยังใหญ่เกินไป ลองปรับค่า compression ใน `compressPDF()` ให้ใช้ quality: 'low'
2. **ความเร็ว**: ปรับค่า `maxConcurrent` ให้เหมาะกับความเร็วอินเทอร์เน็ตของผู้ใช้ (2-3 เป็นค่าที่เหมาะสมสำหรับส่วนใหญ่)
3. **การดีบัก**: เปิดดู console log เพื่อดูขนาดไฟล์ก่อนและหลังบีบอัด
4. **การแก้ไขปัญหา**: หากมีปัญหาเรื่อง CORS ให้ตรวจสอบการตั้งค่า CORS ใน Cloudinary Dashboard
