"use client";

/**
 * คอมโพเนนต์สำหรับแสดงตัวบอกขั้นตอนการกรอกฟอร์ม (Standalone)
 * @param {Object} props
 * @param {number} props.currentStep ขั้นตอนปัจจุบัน
 * @param {number} props.totalSteps จำนวนขั้นตอนทั้งหมด
 * @param {Array} props.steps รายการขั้นตอน (optional)
 */
export const StepIndicator = ({ currentStep, totalSteps, steps }) => {
  // Default steps ถ้าไม่ได้ระบุ
  const defaultSteps = [
    { id: 1, name: "ข้อมูลบริษัท/ผู้สมัคร" },
    { id: 2, name: "ข้อมูลผู้แทน" },
    { id: 3, name: "ข้อมูลธุรกิจ" },
    { id: 4, name: "อัพโหลดเอกสาร" },
    { id: 5, name: "ยืนยันข้อมูล" },
  ].slice(0, totalSteps);

  const stepList = steps || defaultSteps;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {stepList.map((step, index) => (
          <div key={step.id || index + 1} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${
                  currentStep > (step.id || index + 1)
                    ? "bg-green-500 text-white"
                    : currentStep === (step.id || index + 1)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                }`}
            >
              {currentStep > (step.id || index + 1) ? "✓" : step.id || index + 1}
            </div>
            <span className="text-xs mt-2 text-center max-w-[80px]">{step.name}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
        <div
          className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * คอมโพเนนต์สำหรับแสดงปุ่มนำทาง (Standalone)
 * @param {Object} props
 * @param {number} props.currentStep ขั้นตอนปัจจุบัน
 * @param {number} props.totalSteps จำนวนขั้นตอนทั้งหมด
 * @param {Function} props.onPrev ฟังก์ชันเมื่อกดปุ่มย้อนกลับ
 * @param {Function} props.onNext ฟังก์ชันเมื่อกดปุ่มถัดไป
 * @param {Function} props.onSubmit ฟังก์ชันเมื่อกดปุ่มยืนยัน
 * @param {Function} props.onSaveDraft ฟังก์ชันเมื่อกดปุ่มบันทึกร่าง (optional)
 * @param {boolean} props.isSubmitting สถานะกำลังส่งข้อมูล
 * @param {boolean} props.showSaveDraft แสดงปุ่มบันทึกร่างหรือไม่
 */
export const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  showSaveDraft = false,
}) => {
  return (
    <div className="mt-8 flex justify-between">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      )}
      <div className="ml-auto flex gap-3">
        {showSaveDraft && currentStep !== totalSteps && onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            บันทึกร่าง
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ถัดไป
          </button>
        ) : (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการสมัคร"}
          </button>
        )}
      </div>
    </div>
  );
};
