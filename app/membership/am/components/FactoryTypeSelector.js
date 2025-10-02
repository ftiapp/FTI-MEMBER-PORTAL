// components/FactoryTypeSelector.js
"use client";

export default function FactoryTypeSelector({ factoryType, onChange }) {
  return (
    <div className="space-y-6">
      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          สมาชิกสามัญ - สมาคม (สม)
        </h4>
        <p className="text-sm text-blue-800 mb-4">
          เป็นนิติบุคคลที่ดำเนินงานภาคอุตสาหกรรมไทย และประกอบกิจการผลิต แบ่งออกเป็น 2 ประเภท ดังนี้
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type 1 Info */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h5 className="font-semibold text-gray-900">ประเภทที่ 1</h5>
            </div>
            <p className="text-sm text-gray-700 mb-3">มีเครื่องจักรมากกว่า 50 แรงม้า</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                • มีใบอนุญาตประกอบกิจการโรงงาน (รง.4) /
                ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)
              </p>
            </div>
          </div>

          {/* Type 2 Info */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h5 className="font-semibold text-gray-900">ประเภทที่ 2</h5>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              ไม่มีเครื่องจักร / มีเครื่องจักร ต่ำกว่า 5 แรงม้า
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                • ไม่มีใบอนุญาต พิจารณาจากเลขรหัสธุรกิจ (TSIC Code)
                ที่จดทะเบียนกับกรมพัฒนาธุรกิจการค้าที่แสดงถึงความเกี่ยวข้องกับอุตสาหกรรม
                โดยใช้หลักฐาน คือ
              </p>
              <p className="ml-4">▸ รูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต และสถานที่ผลิต</p>
              <p className="ml-4">▸ เอกสารที่ออกโดยหน่วยงานภาครัฐที่แสดงถึงการผลิต (ถ้ามี)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          เลือกประเภทโรงงานของสมาคม
          <span className="text-red-500 ml-1">*</span>
        </h4>
        <div className="space-y-3">
          <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="radio"
              name="factoryType"
              value="type1"
              checked={factoryType === "type1"}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="text-base font-semibold text-gray-900">ประเภทที่ 1</div>
              </div>
              <div className="text-sm text-gray-700 mb-2">มีเครื่องจักรมากกว่า 50 แรงม้า</div>
              <div className="text-xs text-gray-600">
                ต้องมีใบอนุญาตประกอบกิจการโรงงาน (รง.4) หรือ
                ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)
              </div>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer">
            <input
              type="radio"
              name="factoryType"
              value="type2"
              checked={factoryType === "type2"}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="text-base font-semibold text-gray-900">ประเภทที่ 2</div>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                ไม่มีเครื่องจักร / มีเครื่องจักรต่ำกว่า 5 แรงม้า
              </div>
              <div className="text-xs text-gray-600">
                ใช้รูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต สถานที่ผลิต หรือเอกสารจากหน่วยงานภาครัฐ
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
