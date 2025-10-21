import React, { useState } from "react";
import { toast } from "react-hot-toast";

/**
 * Modal สำหรับยืนยันการเปลี่ยนประเภทสมาชิก
 */
const SwitchTypeModal = ({ isOpen, onClose, application, currentType, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  if (!isOpen) return null;

  // กำหนดประเภทที่สามารถเปลี่ยนได้
  const getAvailableTypes = () => {
    const types = [];
    if (currentType === "OC") {
      types.push({ value: "AC", label: "ทน - สมทบ-นิติบุคคล (Associate Company)" });
    } else if (currentType === "AC") {
      types.push({ value: "OC", label: "สน - สามัญ-โรงงาน (Ordinary Company)" });
    }
    return types;
  };

  const availableTypes = getAvailableTypes();

  const handleSwitch = async () => {
    if (!selectedType) {
      toast.error("กรุณาเลือกประเภทสมาชิกที่ต้องการเปลี่ยน");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/admin/membership-requests/switch-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          applicationId: application.id,
          fromType: currentType,
          toType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนประเภทสมาชิก");
      }

      toast.success(data.message || "เปลี่ยนประเภทสมาชิกสำเร็จ");

      // Redirect to new application page
      if (onSuccess) {
        onSuccess(data.data.newId, data.data.newType);
      } else {
        // Default redirect
        window.location.href = `/admin/dashboard/membership-requests/${selectedType}/${data.data.newId}`;
      }
    } catch (error) {
      console.error("Error switching type:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนประเภทสมาชิก");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedType("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              เปลี่ยนประเภทสมาชิก
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-orange-200 transition-colors disabled:opacity-50"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">คำเตือน</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    การเปลี่ยนประเภทสมาชิกจะทำการถ่ายโอนข้อมูลทั้งหมดไปยังประเภทใหม่
                    และลบข้อมูลเดิมออกจากระบบ
                  </p>
                  <p className="mt-2 font-semibold">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Application Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">ข้อมูลใบสมัครปัจจุบัน</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">ประเภทปัจจุบัน:</span>
                <span className="text-blue-900 font-semibold">
                  {currentType === "OC" ? "สน - สามัญ-โรงงาน" : "ทน - สมทบ-นิติบุคคล"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">ชื่อบริษัท:</span>
                <span className="text-blue-900">
                  {application.company_name_th || application.companyNameTh || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">เลขประจำตัวผู้เสียภาษี:</span>
                <span className="text-blue-900 font-mono">
                  {application.tax_id || application.taxId || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">สถานะ:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    application.status === 0 || application.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : application.status === 1 || application.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {application.status === 0 || application.status === "pending"
                    ? "รอพิจารณา"
                    : application.status === 1 || application.status === "approved"
                      ? "อนุมัติแล้ว"
                      : "ปฏิเสธ"}
                </span>
              </div>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เลือกประเภทสมาชิกใหม่ <span className="text-red-500">*</span>
            </label>
            {availableTypes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                ไม่สามารถเปลี่ยนประเภทสมาชิกได้ในขณะนี้
              </div>
            ) : (
              <div className="space-y-3">
                {availableTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedType === type.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="membershipType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                      disabled={isProcessing}
                    />
                    <span className="ml-3 text-gray-900 font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">ข้อมูลที่จะถูกถ่ายโอน:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>ข้อมูลบริษัท (ชื่อ, เลขประจำตัวผู้เสียภาษี, ที่อยู่)</li>
              <li>ข้อมูลผู้ติดต่อและผู้แทนบริษัท</li>
              <li>ประเภทธุรกิจและสินค้า/บริการ</li>
              <li>กลุ่มอุตสาหกรรมและสภาจังหวัด</li>
              <li>เอกสารแนบทั้งหมด</li>
              <li>สถานะการอนุมัติและหมายเหตุ</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isProcessing}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSwitch}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={isProcessing || !selectedType || availableTypes.length === 0}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                ยืนยันเปลี่ยนประเภท
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchTypeModal;
