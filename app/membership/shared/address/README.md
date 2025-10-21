# Address Components

ระบบจัดการที่อยู่แบบ modular สำหรับใช้ในฟอร์มสมัครสมาชิกทุกประเภท

## โครงสร้างไฟล์

```
shared/address/
├── AddressSection.js           # Component หลักที่รวมทุกอย่าง
├── AddressFields.js            # ฟิลด์พื้นฐาน (เลขที่, อาคาร, หมู่, ซอย, ถนน)
├── AddressLocationFields.js    # ฟิลด์ตำแหน่ง (ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)
├── AddressContactFields.js     # ฟิลด์ติดต่อ (โทรศัพท์, อีเมล, เว็บไซต์)
├── AddressTabNavigation.js     # แท็บเลือกประเภทที่อยู่
├── useAddressHandlers.js       # Custom hook สำหรับ logic
├── addressUtils.js             # Utility functions
├── index.js                    # Export ทั้งหมด
└── README.md                   # เอกสารนี้
```

## วิธีใช้งาน

### 1. การใช้งานแบบง่าย (แนะนำ)

```jsx
import { AddressSection } from "@/app/membership/shared/address";

function MyForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  return <AddressSection formData={formData} setFormData={setFormData} errors={errors} />;
}
```

### 2. การใช้งานแบบกำหนดค่า

```jsx
import { AddressSection } from "@/app/membership/shared/address";

function MyForm() {
  return (
    <AddressSection
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      isAutofill={true}
      title="ที่อยู่สมาคม"
      subtitle="กรอกข้อมูลที่อยู่ของสมาคม"
      showCopyButton={true}
      showEmail={true}
      showWebsite={false}
    />
  );
}
```

### 3. การใช้งาน Components แยกส่วน

```jsx
import {
  AddressFields,
  AddressLocationFields,
  AddressContactFields,
  useAddressHandlers,
} from "@/app/membership/shared/address";

function CustomAddressForm() {
  const { activeTab, currentAddress, handleInputChange, handlers, fetchFunctions } =
    useAddressHandlers(formData, setFormData, errors);

  return (
    <div>
      <AddressFields
        currentAddress={currentAddress}
        onInputChange={handleInputChange}
        errors={errors}
        activeTab={activeTab}
      />

      <AddressLocationFields
        currentAddress={currentAddress}
        handlers={handlers}
        fetchFunctions={fetchFunctions}
        errors={errors}
        activeTab={activeTab}
      />

      <AddressContactFields
        currentAddress={currentAddress}
        onInputChange={handleInputChange}
        errors={errors}
        activeTab={activeTab}
      />
    </div>
  );
}
```

### 4. การใช้งาน Utility Functions

```jsx
import {
  copyAddress,
  getCurrentAddress,
  hasAddressErrors,
  findFirstErrorTab,
} from "@/app/membership/shared/address";

// คัดลอกที่อยู่
const copiedAddress = copyAddress(sourceAddress, "2");

// ดึงที่อยู่ปัจจุบัน
const current = getCurrentAddress(addresses, "1");

// ตรวจสอบ error
const hasError = hasAddressErrors(errors, "1");

// หา tab ที่มี error
const errorTab = findFirstErrorTab(errors);
```

## Props ของ AddressSection

| Prop             | Type     | Default                       | Description                   |
| ---------------- | -------- | ----------------------------- | ----------------------------- |
| `formData`       | Object   | **required**                  | ข้อมูลฟอร์มทั้งหมด            |
| `setFormData`    | Function | **required**                  | ฟังก์ชันอัพเดทข้อมูลฟอร์ม     |
| `errors`         | Object   | `{}`                          | ข้อผิดพลาดของฟอร์ม            |
| `isAutofill`     | Boolean  | `false`                       | แสดงว่าข้อมูลถูกเติมอัตโนมัติ |
| `title`          | String   | `"ที่อยู่บริษัท"`             | หัวข้อของ section             |
| `subtitle`       | String   | `"ข้อมูลที่อยู่และการติดต่อ"` | คำอธิบายใต้หัวข้อ             |
| `showCopyButton` | Boolean  | `true`                        | แสดงปุ่มคัดลอกที่อยู่         |
| `showEmail`      | Boolean  | `true`                        | แสดงฟิลด์อีเมล                |
| `showWebsite`    | Boolean  | `true`                        | แสดงฟิลด์เว็บไซต์             |

## โครงสร้างข้อมูล

```javascript
formData = {
  addresses: {
    1: {
      // ที่อยู่สำนักงาน
      addressType: "1",
      addressNumber: "123",
      building: "อาคารตัวอย่าง",
      moo: "5",
      soi: "สุขุมวิท 21",
      street: "สุขุมวิท",
      subDistrict: "คลองเตยเหนือ",
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
      postalCode: "10110",
      "phone-1": "02-123-4567",
      "phoneExtension-1": "101",
      "email-1": "info@example.com",
      "website-1": "https://example.com",
    },
    2: {
      // ที่อยู่จัดส่งเอกสาร
      addressType: "2",
      // ... ฟิลด์เดียวกัน
    },
    3: {
      // ที่อยู่ใบกำกับภาษี
      addressType: "3",
      // ... ฟิลด์เดียวกัน
    },
  },
};
```

## โครงสร้าง Errors

รองรับทั้ง 2 รูปแบบ:

### Flattened Format

```javascript
errors = {
  "addresses.1.addressNumber": "กรุณากรอกเลขที่",
  "addresses.2.phone-2": "กรุณากรอกเบอร์โทรศัพท์",
};
```

### Nested Format

```javascript
errors = {
  addresses: {
    1: {
      addressNumber: "กรุณากรอกเลขที่",
    },
    2: {
      phone: "กรุณากรอกเบอร์โทรศัพท์",
    },
  },
};
```

## Features

✅ รองรับ 3 ประเภทที่อยู่ (สำนักงาน, จัดส่งเอกสาร, ใบกำกับภาษี)  
✅ คัดลอกที่อยู่จากที่อยู่สำนักงานไปยังที่อยู่อื่นได้  
✅ Auto-fill ข้อมูลจากตำบล/รหัสไปรษณีย์  
✅ Validation และแสดง error messages  
✅ Auto-switch ไปยัง tab ที่มี error  
✅ Responsive design  
✅ Loading states  
✅ Customizable (ซ่อน/แสดงฟิลด์ได้)

## ตัวอย่างการใช้งานในแต่ละประเภทสมาชิก

### OC (สามัญ-นิติบุคคล)

```jsx
<AddressSection
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  isAutofill={isAutofill}
  title="ที่อยู่บริษัท"
/>
```

### AC (สมทบ-นิติบุคคล)

```jsx
<AddressSection
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  title="ที่อยู่บริษัท"
/>
```

### IC (สมทบ-บุคคลธรรมดา)

```jsx
<AddressSection
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  title="ที่อยู่"
  subtitle="ข้อมูลที่อยู่และการติดต่อ"
/>
```

### AM (สมทบ-สมาคม)

```jsx
<AddressSection
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  title="ที่อยู่สมาคม"
  subtitle="ข้อมูลที่อยู่ของสมาคม"
/>
```

## การ Migrate จากโค้ดเดิม

### ก่อน

```jsx
import CompanyAddressInfo from "./CompanyAddressInfo";

<CompanyAddressInfo
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  isAutofill={isAutofill}
/>;
```

### หลัง

```jsx
import { AddressSection } from "@/app/membership/shared/address";

<AddressSection
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  isAutofill={isAutofill}
/>;
```

## หมายเหตุ

- ต้องมี `SearchableDropdown` component ใน `@/app/membership/shared/SearchableDropdown`
- ต้องมี API endpoint `/api/thailand-address/search` สำหรับค้นหาข้อมูลที่อยู่
- ใช้ `react-hot-toast` สำหรับแสดง FTI_Portal_User_Notifications
