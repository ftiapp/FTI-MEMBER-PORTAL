// components/MultipleFileManager.js
"use client";

/**
 * Multiple File Manager Component
 * คอมโพเนนต์สำหรับจัดการไฟล์หลายไฟล์ (อัปโหลด, ดู, ลบ)
 * ใช้ร่วมกันระหว่าง AM และ OC
 */
export default function MultipleFileManager({
  files,
  onUpload,
  onView,
  onRemove,
  maxFiles = 5,
  accept = ".pdf,.jpg,.jpeg,.png",
  showEmptyState = true,
}) {
  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="text-center">
        <input
          type="file"
          onChange={onUpload}
          accept={accept}
          multiple
          className="hidden"
          id="multiple-file-upload"
        />
        <label
          htmlFor="multiple-file-upload"
          className="inline-flex items-center gap-3 px-6 py-4 bg-white border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">เพิ่มเอกสาร/รูปภาพ</div>
            <div className="text-xs text-gray-500">PDF, JPG, PNG (ไม่เกิน 10MB)</div>
          </div>
        </label>
      </div>

      {/* File Counter */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {files.length} / {maxFiles} ไฟล์
          </span>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  {file.type.startsWith("image/") ? (
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate block">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onView(file)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="ดูไฟล์"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="ลบไฟล์"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && files.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">ยังไม่มีไฟล์ที่อัปโหลด</p>
          <p className="text-xs text-gray-400">คลิกปุ่มด้านบนเพื่อเพิ่มไฟล์</p>
        </div>
      )}
    </div>
  );
}
