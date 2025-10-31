# การ Refresh เฉพาะกล่องที่แก้ไข (Section-Specific Refresh)

## สรุปการเปลี่ยนแปลง

เมื่อแก้ไขข้อมูลในแต่ละกล่อง (Section) และกดบันทึก ระบบจะ:

1. ✅ บันทึกข้อมูลไปยัง API
2. ✅ ดึงข้อมูลล่าสุดจาก Server กลับมาอัตโนมัติ
3. ✅ อัปเดตเฉพาะกล่องที่แก้ไขโดยไม่ต้อง Refresh ทั้งหน้า
4. ✅ แสดงสถานะ Loading ขณะบันทึก

## ไฟล์ที่แก้ไข

### 1. DetailView.js

**ตำแหน่ง:** `app/admin/dashboard/membership-requests/[type]/[id]/components/DetailView.js`

**การเปลี่ยนแปลง:**

- เพิ่มการ Refetch ข้อมูลจาก Server หลังจากบันทึกสำเร็จ
- ใช้ `updateApplication()` เพื่ออัปเดต State ด้วยข้อมูลล่าสุด

```javascript
// หลังจากบันทึกสำเร็จ
if (result && result.success) {
  console.log("✅ DEBUG: Section update succeeded");

  // Refetch ข้อมูลจาก Server
  console.log("🔄 DEBUG: Refetching section data from server...");
  const refetchResponse = await fetch(`/api/admin/membership-requests/${type}/${application.id}`);

  if (refetchResponse.ok) {
    const refetchData = JSON.parse(await refetchResponse.text());
    if (refetchData.success && refetchData.data) {
      // อัปเดต State ด้วยข้อมูลล่าสุด
      updateApplication(refetchData.data);
      console.log("✅ DEBUG: Section data refetched successfully");
    }
  }
}
```

### 2. useApplicationData.js

**ตำแหน่ง:** `app/admin/dashboard/membership-requests/hooks/useApplicationData.js`

**การเปลี่ยนแปลง:**

- ปรับปรุง `updateApplication()` ให้รองรับทั้ง Partial Update และ Full Data Replacement
- ใช้ `normalizeApplicationData()` เพื่อให้ข้อมูลมีรูปแบบเดียวกัน

```javascript
const updateApplication = (updates) => {
  setApplication((prev) => {
    if (!prev) {
      // ถ้าไม่มีข้อมูลเดิม ให้ Normalize ข้อมูลใหม่
      return normalizeApplicationData(updates, type);
    }

    // ตรวจสอบว่าเป็น Full Data Replacement หรือ Partial Update
    if (updates.id && updates.id === prev.id) {
      // Full Data Replacement - Normalize ข้อมูล
      return normalizeApplicationData(updates, type);
    }

    // Partial Update - Merge กับข้อมูลเดิม
    return { ...prev, ...updates };
  });
};
```

### 3. CompanyInfoSection.js

**ตำแหน่ง:** `app/admin/dashboard/membership-requests/components/sections/CompanyInfoSection.js`

**การเปลี่ยนแปลง:**

- เพิ่ม State `isSaving` เพื่อแสดงสถานะการบันทึก
- อัปเดตปุ่มบันทึกให้แสดง Loading Spinner
- Disable ปุ่มขณะกำลังบันทึก

```javascript
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);
  try {
    await onUpdate("companyInfo", editData);
    setIsEditing(false);
  } catch (error) {
    console.error("Error updating company info:", error);
  } finally {
    setIsSaving(false);
  }
};
```

**ปุ่มบันทึก:**

```jsx
<button
  onClick={handleSave}
  disabled={isSaving}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSaving ? (
    <>
      <svg className="animate-spin h-4 w-4">...</svg>
      กำลังบันทึก...
    </>
  ) : (
    <>
      <svg>...</svg>
      บันทึก
    </>
  )}
</button>
```

### 4. BusinessTypesSection.js

**ตำแหน่ง:** `app/admin/dashboard/membership-requests/components/sections/BusinessTypesSection.js`

**การเปลี่ยนแปลง:**

- เพิ่ม State `isSaving` และ Loading UI เหมือน CompanyInfoSection
- เพิ่ม Error Handling ใน `handleSave()`

## วิธีการทำงาน

### Flow การบันทึกและ Refresh

```
1. User กดปุ่ม "บันทึก" ในกล่องใดกล่องหนึ่ง
   ↓
2. Section แสดงสถานะ "กำลังบันทึก..." (Loading)
   ↓
3. ส่งข้อมูลไปยัง API: POST /api/admin/membership-requests/update
   ↓
4. API บันทึกข้อมูลลง Database
   ↓
5. DetailView.js ดึงข้อมูลล่าสุดจาก API: GET /api/admin/membership-requests/{type}/{id}
   ↓
6. อัปเดต Application State ด้วยข้อมูลใหม่
   ↓
7. React Re-render เฉพาะ Section ที่เปลี่ยนแปลง
   ↓
8. Section กลับสู่โหมดแสดงผล (ไม่ใช่โหมดแก้ไข)
   ↓
9. User เห็นข้อมูลล่าสุดจาก Server
```

## ข้อดี

✅ **ไม่ต้อง Refresh ทั้งหน้า** - ประหยัดเวลาและ Bandwidth
✅ **แสดงข้อมูลล่าสุด** - ดึงจาก Server จริงหลังบันทึก
✅ **UX ที่ดี** - แสดง Loading State ให้ User รู้ว่ากำลังทำงาน
✅ **Error Handling** - จัดการ Error ได้อย่างเหมาะสม
✅ **Consistent Data** - ใช้ normalizeApplicationData() ให้ข้อมูลมีรูปแบบเดียวกัน

## การใช้งานกับ Section อื่นๆ

หากต้องการเพิ่ม Loading State ให้ Section อื่นๆ ทำตามขั้นตอนนี้:

### 1. เพิ่ม State

```javascript
const [isSaving, setIsSaving] = useState(false);
```

### 2. อัปเดต handleSave

```javascript
const handleSave = async () => {
  setIsSaving(true);
  try {
    await onUpdate("sectionName", data);
    setIsEditing(false);
  } catch (error) {
    console.error("Error updating section:", error);
  } finally {
    setIsSaving(false);
  }
};
```

### 3. อัปเดตปุ่มบันทึก

```jsx
<button
  onClick={handleSave}
  disabled={isSaving}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSaving ? (
    <>
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      กำลังบันทึก...
    </>
  ) : (
    <>
      <svg>...</svg>
      บันทึก
    </>
  )}
</button>
```

## Debug Logs

ระบบมี Console Logs เพื่อช่วยในการ Debug:

- `📡 DEBUG: handleSectionUpdate invoked` - เริ่มบันทึก
- `✅ DEBUG: Section update succeeded` - บันทึกสำเร็จ
- `🔄 DEBUG: Refetching section data from server...` - เริ่ม Refetch
- `✅ DEBUG: Section data refetched successfully` - Refetch สำเร็จ
- `❌ DEBUG: Section update failed` - เกิด Error

## ทดสอบการทำงาน

1. เปิด Browser DevTools (F12) → Console Tab
2. ไปที่หน้า Admin Membership Request Detail
3. แก้ไขข้อมูลในกล่องใดกล่องหนึ่ง
4. กดปุ่ม "บันทึก"
5. สังเกต:
   - ปุ่มแสดง "กำลังบันทึก..." พร้อม Spinner
   - Console แสดง Debug Logs
   - ข้อมูลอัปเดตโดยไม่ต้อง Refresh หน้า
   - กล่องอื่นๆ ไม่ถูกรบกวน

## Section ที่รองรับ

✅ CompanyInfoSection (มี Loading State)
✅ BusinessTypesSection (มี Loading State)
✅ ContactPersonSection
✅ AddressSection
✅ RepresentativesSection
✅ IndustrialGroupsSection
✅ FinancialInfoSection
✅ BusinessInfoSection

**หมายเหตุ:** Section อื่นๆ ยังไม่มี Loading State แต่ระบบ Refresh อัตโนมัติทำงานแล้ว
