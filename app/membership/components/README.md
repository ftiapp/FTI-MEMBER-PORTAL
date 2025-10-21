# FormNavigation - คู่มือการใช้งาน

ไฟล์ Navigation กลางสำหรับจัดการฟอร์มสมัครสมาชิกทุกประเภท (IC, OC, AC, AM)

## 📁 ไฟล์ที่เกี่ยวข้อง

- `FormNavigation.js` - Hook และ logic หลัก
- `FormNavigationComponents.js` - Components แยกสำหรับใช้งานแบบ standalone

## 🎯 ฟีเจอร์หลัก

### 1. รองรับทุกประเภทสมาชิก

- **IC** (Individual Corporate) - บุคคลธรรมดา
- **OC** (Ordinary Corporate) - นิติบุคคลสามัญ
- **AC** (Associate Corporate) - นิติบุคคลสมทบ
- **AM** (Association Member) - สมาชิกสมาคม

### 2. ฟีเจอร์ตามประเภท

- ✅ ตรวจสอบบัตรประชาชน (IC)
- ✅ ตรวจสอบ Tax ID (OC, AC)
- ✅ ปุ่มบันทึกร่าง (AC)
- ✅ Step indicator แบบกำหนดเอง
- ✅ Error handling แบบละเอียด
- ✅ Scroll to error field

## 📖 วิธีการใช้งาน

### วิธีที่ 1: ใช้ Hook หลัก (แนะนำ)

```javascript
import { useFormNavigation } from "../components/FormNavigation";

function ICMembershipForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const { StepIndicator, NavigationButtons, handleNextStep, handlePrevStep, isValidating } =
    useFormNavigation({
      membershipType: "IC", // หรือ "OC", "AC", "AM"
      currentStep,
      setCurrentStep,
      formData,
      errors,
      totalSteps: 5,
      validateCurrentStep: validateForm, // ฟังก์ชัน validation ของคุณ
      checkIdCardUniqueness: checkIdCard, // สำหรับ IC
      checkTaxIdUniqueness: checkTaxId, // สำหรับ OC, AC
    });

  return (
    <div>
      <StepIndicator />

      {/* Form content here */}

      <NavigationButtons
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft} // สำหรับ AC
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
```

### วิธีที่ 2: ใช้ Legacy Hooks (Backward Compatible)

```javascript
// สำหรับ IC
import { useICFormNavigation } from "../components/FormNavigation";

const navigation = useICFormNavigation({
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps: 5,
  validateCurrentStep: validateForm,
  checkIdCardUniqueness: checkIdCard,
});

// สำหรับ OC
import { useOCFormNavigation } from "../components/FormNavigation";

const navigation = useOCFormNavigation(validateForm, currentStep, setCurrentStep, totalSteps);

// สำหรับ AC
import { useACFormNavigation } from "../components/FormNavigation";

const navigation = useACFormNavigation(validateForm, currentStep, setCurrentStep, totalSteps);

// สำหรับ AM
import { useAMFormNavigation } from "../components/FormNavigation";

const navigation = useAMFormNavigation(validateForm);
```

### วิธีที่ 3: ใช้ Components แยก

```javascript
import { StepIndicator, NavigationButtons } from "../components/FormNavigationComponents";

function CustomForm() {
  return (
    <div>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={5}
        steps={[
          { id: 1, name: "ขั้นตอนที่ 1" },
          { id: 2, name: "ขั้นตอนที่ 2" },
          // ...
        ]}
      />

      <NavigationButtons
        currentStep={currentStep}
        totalSteps={5}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
        showSaveDraft={true}
      />
    </div>
  );
}
```

## ⚙️ Configuration

### MEMBERSHIP_CONFIGS

แต่ละประเภทสมาชิกมี configuration ดังนี้:

```javascript
{
  steps: [...],              // รายการขั้นตอน
  validateIdCard: boolean,   // ตรวจสอบบัตรประชาชนหรือไม่
  validateTaxId: boolean,    // ตรวจสอบ Tax ID หรือไม่
  showSaveDraft: boolean,    // แสดงปุ่มบันทึกร่างหรือไม่
}
```

## 🔧 Parameters

### useFormNavigation Options

| Parameter               | Type     | Required | Description                          |
| ----------------------- | -------- | -------- | ------------------------------------ |
| `membershipType`        | string   | Yes      | ประเภทสมาชิก: "IC", "OC", "AC", "AM" |
| `currentStep`           | number   | Yes      | ขั้นตอนปัจจุบัน                      |
| `setCurrentStep`        | function | Yes      | ฟังก์ชันเปลี่ยนขั้นตอน               |
| `formData`              | object   | Yes      | ข้อมูลฟอร์ม                          |
| `errors`                | object   | Yes      | ข้อผิดพลาด                           |
| `totalSteps`            | number   | Yes      | จำนวนขั้นตอนทั้งหมด                  |
| `validateCurrentStep`   | function | Yes      | ฟังก์ชัน validation                  |
| `checkIdCardUniqueness` | function | No       | ตรวจสอบบัตรประชาชน (IC)              |
| `checkTaxIdUniqueness`  | function | No       | ตรวจสอบ Tax ID (OC, AC)              |

### Return Values

| Property            | Type      | Description            |
| ------------------- | --------- | ---------------------- |
| `StepIndicator`     | Component | Component แสดงขั้นตอน  |
| `NavigationButtons` | Component | Component ปุ่มนำทาง    |
| `handleNextStep`    | function  | ฟังก์ชันไปขั้นตอนถัดไป |
| `handlePrevStep`    | function  | ฟังก์ชันย้อนกลับ       |
| `isValidating`      | boolean   | สถานะกำลังตรวจสอบ      |

## 📝 ตัวอย่างการใช้งานแบบเต็ม

### IC Membership Form

```javascript
"use client";

import { useState } from "react";
import { useFormNavigation } from "../components/FormNavigation";
import { validateICForm } from "../utils/validation";
import { checkIdCardUniqueness } from "../api/check-id-card";

export default function ICMembershipForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    idCardNumber: "",
    firstName: "",
    lastName: "",
    // ...
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { StepIndicator, NavigationButtons, isValidating } = useFormNavigation({
    membershipType: "IC",
    currentStep,
    setCurrentStep,
    formData,
    errors,
    totalSteps: 5,
    validateCurrentStep: (step, data) => validateICForm(data, step),
    checkIdCardUniqueness,
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit logic
      const response = await fetch("/api/member/ic-membership/submit", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      // Handle response
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">สมัครสมาชิก IC</h1>

      <StepIndicator />

      <div className="bg-white rounded-lg shadow p-6">
        {/* Step 1 */}
        {currentStep === 1 && <div>{/* Form fields */}</div>}

        {/* Step 2-5 */}
        {/* ... */}
      </div>

      <NavigationButtons onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
```

### AC Membership Form (with Save Draft)

```javascript
const { StepIndicator, NavigationButtons } = useFormNavigation({
  membershipType: "AC",
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps: 5,
  validateCurrentStep: validateACForm,
  checkTaxIdUniqueness,
});

const handleSaveDraft = async () => {
  // Save draft logic
  await fetch("/api/member/ac-membership/save-draft", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

return (
  <div>
    <StepIndicator />
    {/* Form content */}
    <NavigationButtons
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
      isSubmitting={isSubmitting}
    />
  </div>
);
```

## 🔄 Migration Guide

### จาก ICFormNavigation.js

**เดิม:**

```javascript
import { useICFormNavigation } from "./ICFormNavigation";

const { StepIndicator, NavigationButtons, ... } = useICFormNavigation({
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps,
  validateCurrentStep,
  checkIdCardUniqueness,
});
```

**ใหม่:**

```javascript
import { useFormNavigation } from "../components/FormNavigation";

const { StepIndicator, NavigationButtons, ... } = useFormNavigation({
  membershipType: "IC",
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps,
  validateCurrentStep,
  checkIdCardUniqueness,
});
```

### จาก OCFormNavigation.js / ACFormNavigation.js

**เดิม:**

```javascript
import { useOCFormNavigation } from "./OCFormNavigation";

const {
  currentStep,
  setCurrentStep,
  handleNextStep,
  handlePrevStep,
  ...
} = useOCFormNavigation(validateForm, currentStep, setCurrentStep, totalSteps);
```

**ใหม่:**

```javascript
import { useFormNavigation } from "../components/FormNavigation";

const { handleNextStep, handlePrevStep, ... } = useFormNavigation({
  membershipType: "OC", // หรือ "AC"
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps,
  validateCurrentStep: (step, data) => validateForm(data, step),
  checkTaxIdUniqueness,
});
```

### จาก AMFormNavigation.js

**เดิม:**

```javascript
import { useAMFormNavigation } from "./AMFormNavigation";

const {
  currentStep,
  setCurrentStep,
  handleNextStep,
  handlePrevStep,
  ...
} = useAMFormNavigation(validateForm);
```

**ใหม่:**

```javascript
import { useFormNavigation } from "../components/FormNavigation";

const { handleNextStep, handlePrevStep, ... } = useFormNavigation({
  membershipType: "AM",
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps: 5,
  validateCurrentStep: (step, data) => validateForm(data, step),
});
```

## 🎨 Customization

### กำหนด Steps เอง

```javascript
import { MEMBERSHIP_CONFIGS } from "../components/FormNavigation";

// แก้ไข config
MEMBERSHIP_CONFIGS.IC.steps = [
  { id: 1, name: "ข้อมูลพื้นฐาน", description: "ข้อมูลส่วนตัว" },
  { id: 2, name: "ข้อมูลติดต่อ", description: "ที่อยู่และเบอร์โทร" },
  // ...
];
```

### Custom Validation

```javascript
const validateCurrentStep = (step, formData) => {
  const errors = {};

  if (step === 1) {
    if (!formData.firstName) {
      errors.firstName = "กรุณากรอกชื่อ";
    }
    // ...
  }

  return errors;
};
```

## 🐛 Troubleshooting

### ปัญหา: Toast ไม่แสดง

**แก้ไข:** ตรวจสอบว่าได้ import `react-hot-toast` และมี `<Toaster />` ในแอพแล้ว

### ปัญหา: Scroll to error ไม่ทำงาน

**แก้ไข:** ตรวจสอบว่า input fields มี `name` attribute ที่ตรงกับ error keys

### ปัญหา: ID Card validation ไม่ทำงาน

**แก้ไข:** ตรวจสอบว่าได้ส่ง `checkIdCardUniqueness` function และ `membershipType: "IC"`

## 📚 เพิ่มเติม

- [Validation Utils](../utils/validation/README.md)
- [API Documentation](../../api/README.md)
- [Form Components](./README-Components.md)

## 🤝 Contributing

หากต้องการเพิ่มฟีเจอร์หรือแก้ไข:

1. แก้ไขที่ `FormNavigation.js`
2. อัพเดท `MEMBERSHIP_CONFIGS` ถ้าจำเป็น
3. เพิ่ม tests
4. อัพเดทเอกสารนี้

## 📄 License

Internal use only - FTI Member Portal
