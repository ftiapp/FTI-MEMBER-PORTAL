export default function ModeSelection({ isAutofill, toggleAutofill }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="text-base font-medium text-gray-900 mb-4">วิธีการกรอกข้อมูล</h4>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="autofill"
            name="fillMode"
            checked={isAutofill}
            onChange={toggleAutofill}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="autofill"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            ดึงข้อมูลอัตโนมัติ
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="manual"
            name="fillMode"
            checked={!isAutofill}
            onChange={toggleAutofill}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="manual"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            กรอกข้อมูลเอง
          </label>
        </div>
      </div>
    </div>
  );
}
