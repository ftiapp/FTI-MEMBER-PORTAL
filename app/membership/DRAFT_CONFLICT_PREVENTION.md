# การป้องกัน Draft Conflict - Draft Conflict Prevention

## 📋 สรุปปัญหา (Problem Summary)

### ปัญหาเดิม (Original Issue)
ระบบมีช่องโหว่ที่ทำให้เกิด **Race Condition** เมื่อมี 2 users พยายามใช้ Tax ID/ID Card เดียวกัน:

1. **User A** กรอก Tax ID `1234567890123` และเริ่มกรอกฟอร์ม
2. **User B** กรอก Tax ID `1234567890123` เดียวกันและเริ่มกรอกฟอร์ม
3. ทั้งคู่กรอกข้อมูลได้ปกติ
4. **User A** กด Save Draft ก่อน → สำเร็จ
5. **User B** กด Save Draft ทีหลัง → ถูกบล็อก (แต่เสียเวลากรอกไปแล้ว)

### ผลกระทบ (Impact)
- ❌ UX ไม่ดี - ผู้ใช้เสียเวลากรอกข้อมูลทั้งหมดแล้วค่อยรู้ว่าใช้ไม่ได้
- ❌ ข้อมูลอาจถูกทับ - ถ้ามีการแก้ไข logic ผิดพลาด
- ❌ สับสน - ผู้ใช้ไม่เข้าใจว่าทำไมถูกบล็อก

---

## ✅ แนวทางแก้ไข (Solution)

### 1. Early Validation - ตรวจสอบทันทีที่กรอก Tax ID/ID Card

สร้าง **Real-time validation** ที่ตรวจสอบทันทีเมื่อผู้ใช้กรอก Tax ID หรือ ID Card ครบ 13 หลัก:

```
User กรอก Tax ID → ระบบตรวจสอบทันที → แสดงผลทันที
```

### 2. Block Form Immediately - บล็อกฟอร์มทันทีถ้าไม่สามารถใช้ได้

ถ้า Tax ID/ID Card ถูกใช้โดยผู้อื่นแล้ว:
- 🚫 บล็อกฟอร์มทั้งหมด (overlay)
- 📢 แสดงข้อความชัดเจน
- ⚠️ ป้องกันไม่ให้กรอกข้อมูลต่อ

---

## 🏗️ สิ่งที่สร้างขึ้น (What Was Created)

### 1. API Endpoint: `/api/membership/check-draft-availability`

**ไฟล์:** `app/api/membership/check-draft-availability/route.js`

**หน้าที่:**
- ตรวจสอบว่า Tax ID/ID Card สามารถใช้ได้หรือไม่
- ตรวจสอบใน Main Tables (MemberRegist_XX_Main)
- ตรวจสอบใน Draft Tables (MemberRegist_XX_Draft)
- ตรวจสอบว่า draft เป็นของ user คนเดียวกันหรือไม่

**Response Format:**
```json
{
  "success": true,
  "available": true/false,
  "message": "ข้อความแจ้งเตือน",
  "reason": "available|draft_exists_same_user|draft_exists_other_user|exists_in_main",
  "draftId": 123  // ถ้ามี draft ของ user เอง
}
```

**Cases:**
1. ✅ **Available** - สามารถใช้ได้
2. ℹ️ **Draft exists (same user)** - มี draft ของตัวเองอยู่แล้ว (อนุญาตให้แก้ไขต่อ)
3. ❌ **Draft exists (other user)** - มี draft ของผู้อื่น (บล็อก)
4. ❌ **Exists in main** - มีในระบบหลักแล้ว (บล็อก)

---

### 2. Custom Hook: `useDraftAvailability`

**ไฟล์:** `app/membership/hooks/useDraftAvailability.js`

**หน้าที่:**
- จัดการ state ของการตรวจสอบ
- เรียก API check-draft-availability
- จัดการ debounce และ abort controller
- แสดง toast notification

**Usage:**
```javascript
import { useDraftAvailability } from "@/app/membership/hooks/useDraftAvailability";

const { 
  checkAvailability,    // ฟังก์ชันตรวจสอบ
  isChecking,           // กำลังตรวจสอบอยู่
  availabilityStatus,   // ผลการตรวจสอบ
  isBlocked,            // ควรบล็อกฟอร์มหรือไม่
  resetAvailability     // รีเซ็ต state
} = useDraftAvailability("ac");

// เรียกใช้
await checkAvailability("1234567890123");
```

---

### 3. UI Components: Draft Availability Checker

**ไฟล์:** `app/membership/components/DraftAvailabilityChecker.js`

**Components:**

#### 3.1 `DraftAvailabilityIndicator`
แสดงสถานะการตรวจสอบ:
- 🔄 กำลังตรวจสอบ... (loading spinner)
- ✅ สามารถใช้หมายเลขนี้ได้ (green)
- ℹ️ คุณมีร่างที่บันทึกไว้แล้ว (blue info box)
- ❌ หมายเลขนี้ถูกใช้แล้ว (red error box)

#### 3.2 `WithDraftAvailabilityCheck`
HOC สำหรับ wrap input field เพื่อเพิ่ม auto-check:
```javascript
<WithDraftAvailabilityCheck
  value={formData.taxId}
  onChange={handleChange}
  checkAvailability={checkAvailability}
  debounceMs={800}
>
  <input ... />
</WithDraftAvailabilityCheck>
```

#### 3.3 `DraftAvailabilityBlocker`
Overlay สำหรับบล็อกฟอร์มเมื่อ ID ไม่สามารถใช้ได้:
```javascript
<DraftAvailabilityBlocker isBlocked={isBlocked}>
  <form>...</form>
</DraftAvailabilityBlocker>
```

---

## 🔧 วิธีการใช้งาน (How to Integrate)

### สำหรับ AC Form (และ OC, AM ที่ใช้ Tax ID)

#### Step 1: Import Hook และ Components

```javascript
// ใน CompanyBasicInfo.js หรือ CompanyInfoSection.js
import { useDraftAvailability } from "@/app/membership/hooks/useDraftAvailability";
import { 
  DraftAvailabilityIndicator,
  WithDraftAvailabilityCheck,
  DraftAvailabilityBlocker 
} from "@/app/membership/components/DraftAvailabilityChecker";
```

#### Step 2: เพิ่ม Hook ใน Component

```javascript
export default function CompanyBasicInfo({ formData, setFormData, errors, setErrors }) {
  // เพิ่ม hook
  const { 
    checkAvailability, 
    isChecking, 
    availabilityStatus, 
    isBlocked 
  } = useDraftAvailability("ac"); // "ac", "oc", "am", หรือ "ic"
  
  // ... existing code
}
```

#### Step 3: แก้ไข handleTaxIdChange

```javascript
const handleTaxIdChange = (e) => {
  const { value } = e.target;
  const numericValue = value.replace(/\D/g, "").slice(0, 13);

  setFormData((prev) => ({ ...prev, taxId: numericValue }));
  
  // Clear existing validation
  setValidationStatus({ status: "idle", message: "" });
  if (errors.taxId) {
    setErrors((prev) => ({ ...prev, taxId: undefined }));
  }

  if (taxIdTimeoutRef.current) clearTimeout(taxIdTimeoutRef.current);

  if (numericValue.length === 13) {
    taxIdTimeoutRef.current = setTimeout(async () => {
      // ✅ เพิ่ม: ตรวจสอบ draft availability ก่อน
      const availabilityResult = await checkAvailability(numericValue);
      
      // ถ้าไม่สามารถใช้ได้ ให้หยุดเลย
      if (!availabilityResult.available) {
        return;
      }
      
      // ถ้าใช้ได้ ให้ตรวจสอบ uniqueness ต่อ (existing logic)
      const isValid = await checkTaxIdUniqueness(numericValue);
      if (isValid && isAutofill) {
        fetchCompanyInfo(numericValue);
      }
    }, 500);
  }
};
```

#### Step 4: เพิ่ม Indicator ใน JSX (ใต้ Tax ID input)

```javascript
<div className="space-y-2">
  <label htmlFor="taxId">
    เลขประจำตัวผู้เสียภาษี
    <span className="text-red-500 ml-1">*</span>
  </label>

  <input
    type="text"
    id="taxId"
    name="taxId"
    value={formData.taxId || ""}
    onChange={handleTaxIdChange}
    maxLength={13}
    // ... existing props
  />

  {/* ✅ เพิ่ม: แสดงสถานะการตรวจสอบ draft */}
  <DraftAvailabilityIndicator
    isChecking={isChecking}
    availabilityStatus={availabilityStatus}
    isBlocked={isBlocked}
  />

  {/* Existing validation status */}
  {validationStatus.message && (
    <p className={...}>
      {validationStatus.message}
    </p>
  )}
</div>
```

#### Step 5: เพิ่ม Blocker รอบฟอร์ม (ใน parent component)

```javascript
// ใน CompanyInfoSection.js หรือ ACMembershipForm.js
return (
  <DraftAvailabilityBlocker isBlocked={isBlocked}>
    <div className="space-y-6">
      <CompanyBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isBlocked={isBlocked}  // ส่ง prop ไปด้วย
      />
      {/* ... other sections */}
    </div>
  </DraftAvailabilityBlocker>
);
```

#### Step 6: ป้องกัน Save Draft เมื่อ Blocked

```javascript
// ใน ACMembershipForm.js หรือ handlers.js
const handleSaveDraft = async () => {
  // ✅ เพิ่ม: ตรวจสอบก่อน save
  if (isBlocked) {
    toast.error("ไม่สามารถบันทึกร่างได้ กรุณาตรวจสอบข้อมูล");
    return;
  }
  
  // ... existing save draft logic
};
```

---

### สำหรับ IC Form (ใช้ ID Card Number)

ขั้นตอนเหมือนกัน แต่เปลี่ยนจาก `taxId` เป็น `idCardNumber`:

```javascript
// Step 2: เปลี่ยน member type
const { checkAvailability, isChecking, availabilityStatus, isBlocked } 
  = useDraftAvailability("ic");

// Step 3: ใช้กับ idCardNumber field
const handleIdCardChange = (e) => {
  const { value } = e.target;
  const numericValue = value.replace(/\D/g, "").slice(0, 13);

  setFormData((prev) => ({ ...prev, idCardNumber: numericValue }));

  if (numericValue.length === 13) {
    setTimeout(async () => {
      await checkAvailability(numericValue);
    }, 500);
  }
};
```

---

## 🎯 ผลลัพธ์ที่ได้ (Expected Outcome)

### ✅ ก่อนแก้ไข (Before)
1. User กรอกฟอร์มทั้งหมด (5-10 นาที)
2. กด Save Draft
3. ❌ Error: "Tax ID นี้ถูกใช้แล้ว"
4. 😡 User โกรธ เสียเวลา

### ✅ หลังแก้ไข (After)
1. User กรอก Tax ID
2. ⚡ ระบบตรวจสอบทันที (< 1 วินาที)
3. ❌ แสดงข้อความ: "Tax ID นี้มีการบันทึกร่างโดยผู้ใช้อื่นอยู่แล้ว"
4. 🚫 บล็อกฟอร์มทันที
5. 😊 User เปลี่ยน Tax ID ใหม่ก่อนเสียเวลากรอก

---

## 🔒 การป้องกันที่มีอยู่ (Existing Protections)

### 1. Database Level
- **Unique Index** บน `tax_id` และ `idcard` columns
- **Status Filter** - เช็คเฉพาะ `status = 3` (active drafts)

### 2. API Level (save-draft/route.js)
```javascript
// บรรทัด 163-183
if (existingDraft && existingDraft.length > 0) {
  const draftOwnerId = existingDraft[0].user_id;
  if (draftOwnerId !== userId) {
    return NextResponse.json({
      success: false,
      message: `${idFieldName} ${uniqueId} มีการบันทึกร่างโดยผู้ใช้อื่นอยู่แล้ว`
    }, { status: 409 });
  }
}
```

### 3. Frontend Level (NEW)
- **Early validation** - ตรวจสอบก่อนกรอกฟอร์ม
- **UI blocking** - บล็อกฟอร์มทันที
- **Real-time feedback** - แสดงผลทันที

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User กรอก Tax ID (13 หลัก)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Debounce 800ms (รอให้ user พิมพ์เสร็จ)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  เรียก API: /api/membership/check-draft-availability        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  ✅ Available    │    │  ❌ Not Available│
│  - แสดง ✓        │    │  - แสดง ✗        │
│  - ให้กรอกต่อ    │    │  - บล็อกฟอร์ม    │
│                  │    │  - แสดง error    │
└──────────────────┘    └──────────────────┘
```

---

## 🧪 การทดสอบ (Testing)

### Test Cases

#### 1. Tax ID ใหม่ (ยังไม่มีในระบบ)
- ✅ แสดง: "สามารถใช้หมายเลขนี้ได้"
- ✅ ให้กรอกฟอร์มต่อได้

#### 2. Tax ID ที่มี draft ของตัวเอง
- ℹ️ แสดง: "คุณมีร่างที่บันทึกไว้แล้ว สามารถแก้ไขต่อได้"
- ✅ ให้กรอกฟอร์มต่อได้ (edit mode)

#### 3. Tax ID ที่มี draft ของผู้อื่น
- ❌ แสดง: "หมายเลขนี้มีการบันทึกร่างโดยผู้ใช้อื่นอยู่แล้ว"
- 🚫 บล็อกฟอร์มทันที
- ❌ Save Draft ไม่ได้

#### 4. Tax ID ที่อยู่ในระบบหลักแล้ว (status = 0 หรือ 1)
- ❌ แสดง: "หมายเลขนี้มีคำขอสมัครอยู่ระหว่างพิจารณา" หรือ "เป็นสมาชิกแล้ว"
- 🚫 บล็อกฟอร์มทันที

#### 5. Tax ID ที่เคยถูกปฏิเสธ (status = 2)
- ✅ แสดง: "สามารถใช้หมายเลขนี้ได้"
- ✅ ให้กรอกฟอร์มต่อได้ (สมัครใหม่)

---

## 📝 สรุป (Summary)

### ปัญหาที่แก้ไข
✅ ป้องกัน race condition เมื่อหลาย users ใช้ Tax ID เดียวกัน  
✅ ป้องกัน UX ที่ไม่ดี (เสียเวลากรอกแล้วค่อยรู้ว่าใช้ไม่ได้)  
✅ แจ้งเตือนชัดเจนทันทีที่กรอก Tax ID/ID Card  

### สิ่งที่สร้างขึ้น
1. ✅ API: `/api/membership/check-draft-availability`
2. ✅ Hook: `useDraftAvailability`
3. ✅ Components: `DraftAvailabilityChecker`
4. ✅ Documentation: คู่มือนี้

### ขั้นตอนถัดไป
1. 🔧 Integrate เข้ากับ AC Form (CompanyBasicInfo.js)
2. 🔧 Integrate เข้ากับ OC Form
3. 🔧 Integrate เข้ากับ AM Form
4. 🔧 Integrate เข้ากับ IC Form
5. 🧪 ทดสอบทุก test cases
6. 📊 Monitor production usage

---

## 🤝 ผู้พัฒนา (Developer Notes)

- สร้างโดย: Cascade AI Assistant
- วันที่: 2025-10-17
- เวอร์ชัน: 1.0
- สถานะ: ✅ Ready for integration

**หมายเหตุ:** ระบบนี้ออกแบบมาให้ทำงานร่วมกับ validation ที่มีอยู่แล้ว ไม่ได้แทนที่ แต่เพิ่มชั้นการป้องกันเพิ่มเติม
