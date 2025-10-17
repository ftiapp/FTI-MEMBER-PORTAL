/**
 * ตัวอย่างการ Integrate Draft Availability Check เข้ากับ AC Form
 * 
 * ไฟล์นี้แสดงตัวอย่างการแก้ไข CompanyBasicInfo.js
 * เพื่อเพิ่มการตรวจสอบ draft availability
 */

// ============================================================================
// STEP 1: เพิ่ม imports ที่จำเป็น (บรรทัดต้นๆ ของไฟล์)
// ============================================================================

import { useDraftAvailability } from "@/app/membership/hooks/useDraftAvailability";
import { 
  DraftAvailabilityIndicator,
  DraftAvailabilityBlocker 
} from "@/app/membership/components/DraftAvailabilityChecker";

// ============================================================================
// STEP 2: เพิ่ม hook ใน component
// ============================================================================

export default function CompanyBasicInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  isAutofill,
  setIsAutofill,
  isLoading,
}) {
  // ✅ เพิ่ม: Draft availability hook
  const { 
    checkAvailability, 
    isChecking: isDraftChecking, 
    availabilityStatus, 
    isBlocked 
  } = useDraftAvailability("ac");

  // ... existing state declarations
  const [isThrottled, setIsThrottled] = useState(false);
  const [validationStatus, setValidationStatus] = useState({ status: "idle", message: "" });
  const [isFetchingDBD, setIsFetchingDBD] = useState(false);
  const lastFetchTime = useRef(0);
  const throttleTime = 5000;
  const taxIdTimeoutRef = useRef(null);

  // ============================================================================
  // STEP 3: แก้ไข handleTaxIdChange เพื่อเพิ่มการตรวจสอบ draft
  // ============================================================================

  const handleTaxIdChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, "").slice(0, 13);

    setFormData((prev) => ({ ...prev, taxId: numericValue }));
    setValidationStatus({ status: "idle", message: "" });
    if (errors.taxId) {
      setErrors((prev) => ({ ...prev, taxId: undefined }));
    }

    if (taxIdTimeoutRef.current) clearTimeout(taxIdTimeoutRef.current);

    if (numericValue.length === 13) {
      taxIdTimeoutRef.current = setTimeout(async () => {
        // ✅ เพิ่ม: ตรวจสอบ draft availability ก่อนอื่น
        const availabilityResult = await checkAvailability(numericValue);
        
        // ถ้าไม่สามารถใช้ได้ (blocked) ให้หยุดเลย
        if (!availabilityResult.available && availabilityResult.reason !== "draft_exists_same_user") {
          // ไม่ต้องทำอะไรต่อ เพราะ hook จะจัดการ UI และ blocking เอง
          return;
        }
        
        // ✅ ถ้าใช้ได้ หรือเป็น draft ของตัวเอง ให้ทำ validation ต่อ (existing logic)
        const isValid = await checkTaxIdUniqueness(numericValue);
        if (isValid && isAutofill) {
          fetchCompanyInfo(numericValue);
        }
      }, 500);
    }
  };

  // ============================================================================
  // STEP 4: แก้ไข JSX เพื่อแสดง draft availability indicator
  // ============================================================================

  return (
    <>
      <LoadingOverlay 
        isVisible={isFetchingDBD} 
        message="กำลังดึงข้อมูลจากกรมพัฒนาธุรกิจการค้า..."
      />
      
      {/* ✅ เพิ่ม: Wrapper สำหรับบล็อกฟอร์มเมื่อ draft ไม่ available */}
      <DraftAvailabilityBlocker isBlocked={isBlocked}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-blue-600 px-8 py-6">
            <h3 className="text-xl font-semibold text-white tracking-tight">
              ข้อมูลบริษัท / Company Information
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              กรอกข้อมูลพื้นฐานของบริษัท / Enter basic company information
            </p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 space-y-8">
            {/* Mode Selection Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              {/* ... existing mode selection code ... */}
            </div>

            {/* Company Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
                ข้อมูลพื้นฐาน
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax ID Field */}
                <div className="space-y-2">
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-900">
                    เลขประจำตัวผู้เสียภาษี
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      id="taxId"
                      name="taxId"
                      value={formData.taxId || ""}
                      onChange={handleTaxIdChange}
                      maxLength={13}
                      required
                      placeholder="0000000000000"
                      className={`
                        w-full px-4 py-3 text-sm
                        border rounded-lg
                        bg-white
                        placeholder-gray-400
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          validationStatus.status === "invalid"
                            ? "border-red-300 bg-red-50"
                            : validationStatus.status === "valid"
                              ? "border-green-300 bg-green-50"
                              : "border-gray-300 hover:border-gray-400"
                        }
                        ${isAutofill || validationStatus.status === "checking" ? "pr-28" : ""}
                      `}
                      disabled={validationStatus.status === "checking" || isDraftChecking}
                    />

                    {/* Existing status badge code ... */}
                  </div>

                  {/* ✅ เพิ่ม: Draft Availability Indicator */}
                  <DraftAvailabilityIndicator
                    isChecking={isDraftChecking}
                    availabilityStatus={availabilityStatus}
                    isBlocked={isBlocked}
                  />

                  {/* Existing validation status messages */}
                  {validationStatus.message && (
                    <p
                      className={`mt-1 text-sm flex items-center gap-2 ${
                        validationStatus.status === "invalid"
                          ? "text-red-600"
                          : validationStatus.status === "valid"
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    >
                      {/* ... existing validation status UI ... */}
                      {validationStatus.message}
                    </p>
                  )}
                </div>

                {/* Company Name Field */}
                <div className="space-y-2">
                  {/* ... existing company name field ... */}
                </div>

                {/* Company Name English Field */}
                <div className="space-y-2">
                  {/* ... existing company name english field ... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DraftAvailabilityBlocker>
    </>
  );
}

// ============================================================================
// STEP 5: แก้ไข parent component (CompanyInfoSection.js) ถ้าจำเป็น
// ============================================================================

// ถ้า CompanyInfoSection.js เป็น wrapper ของ CompanyBasicInfo
// ให้ส่ง isBlocked prop ไปด้วย:

export default function CompanyInfoSection({ 
  formData, 
  setFormData, 
  errors, 
  setErrors 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofill, setIsAutofill] = useState(true);
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);
  
  // ✅ เพิ่ม: Draft availability hook (ถ้าต้องการใช้ isBlocked ใน parent)
  const { isBlocked } = useDraftAvailability("ac");
  
  const { industrialGroups, provincialChapters, isLoading: isLoadingGroups } = useIndustrialGroups();

  // ... handlers

  return (
    <div className="space-y-6">
      <CompanyBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isAutofill={isAutofill}
        setIsAutofill={setIsAutofill}
        isLoading={isLoading}
        isCheckingTaxId={isCheckingTaxId}
      />

      {/* ... other sections ... */}
    </div>
  );
}

// ============================================================================
// STEP 6: แก้ไข Save Draft handler (ACMembershipForm.js หรือ handlers.js)
// ============================================================================

// ใน ACMembershipForm.js หรือ handlers.js
const handleSaveDraft = async () => {
  // ✅ เพิ่ม: ตรวจสอบว่า form ถูก block หรือไม่
  if (isBlocked) {
    toast.error("ไม่สามารถบันทึกร่างได้ เนื่องจากเลขประจำตัวผู้เสียภาษีนี้ถูกใช้งานแล้ว");
    return;
  }
  
  // ... existing save draft logic
  setShowDraftSavePopup(true);
  
  try {
    const result = await saveDraft({
      ...formData,
      currentStep,
    });

    if (result.success) {
      toast.success("บันทึกร่างสำเร็จ");
      setShowDraftSavePopup(false);
    } else {
      toast.error(result.message || "ไม่สามารถบันทึกร่างได้");
      setShowDraftSavePopup(false);
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
    setShowDraftSavePopup(false);
  }
};

// ============================================================================
// หมายเหตุสำคัญ (Important Notes)
// ============================================================================

/**
 * 1. Hook useDraftAvailability จะจัดการ state ทั้งหมดเอง:
 *    - isChecking: กำลังตรวจสอบ
 *    - availabilityStatus: ผลการตรวจสอบ
 *    - isBlocked: ควรบล็อกฟอร์มหรือไม่
 * 
 * 2. DraftAvailabilityIndicator จะแสดง UI feedback ให้ user เห็น
 * 
 * 3. DraftAvailabilityBlocker จะบล็อกฟอร์มทั้งหมดด้วย overlay
 * 
 * 4. การตรวจสอบจะเกิดขึ้นทันทีเมื่อ user กรอก Tax ID ครบ 13 หลัก
 * 
 * 5. ถ้า Tax ID ถูกใช้โดยผู้อื่น:
 *    - แสดง error message ชัดเจน
 *    - บล็อกฟอร์มทันที
 *    - ป้องกันการ save draft
 * 
 * 6. ถ้า Tax ID เป็นของ user เอง (มี draft อยู่แล้ว):
 *    - แสดง info message
 *    - ให้แก้ไขต่อได้ (edit mode)
 * 
 * 7. ระบบนี้ทำงานร่วมกับ validation ที่มีอยู่แล้ว:
 *    - checkTaxIdUniqueness (ตรวจสอบใน main tables)
 *    - fetchCompanyInfo (ดึงข้อมูลจาก DBD)
 */
