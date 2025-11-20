import { toast } from "react-hot-toast";

function DebugToast() {
  const testToast = (type, message) => {
    console.log(`Testing ${type} toast:`, message);

    const toastOptions = {
      position: "top-right",
      duration: 4000,
      style: {
        zIndex: "9999 !important",
        position: "fixed !important",
        top: "20px !important",
        right: "20px !important",
        maxWidth: "400px",
        minWidth: "300px",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: type === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0",
        background: type === "error" ? "#fef2f2" : "#f0fdf4",
        color: type === "error" ? "#dc2626" : "#15803d",
      },
      className: `toast-notification toast-${type}`,
    };

    if (type === "error") {
      toast.error(message, toastOptions);
    } else {
      toast.success(message, toastOptions);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 space-y-2 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold text-gray-700">Toast Debug Panel</h3>
      <div className="space-y-2">
        <button
          onClick={() => testToast("error", "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น")}
          className="block w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Test Email Exists Error
        </button>
        <button
          onClick={() => testToast("error", "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่น")}
          className="block w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Test Phone Exists Error
        </button>
        <button
          onClick={() => testToast("error", "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง")}
          className="block w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Test Validation Error
        </button>
        <button
          onClick={() =>
            testToast("success", "สมัครเข้าใช้งานระบบสำเร็จ! กำลังนำท่านไปยังหน้าตรวจสอบอีเมล")
          }
          className="block w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Test Success Message
        </button>
        <button
          onClick={() => {
            console.log("Current Toaster state:", toast);
            console.log("DOM toasts:", document.querySelectorAll("[data-hot-toast]"));
          }}
          className="block w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Debug Toast State
        </button>
      </div>
    </div>
  );
}

export default DebugToast;
