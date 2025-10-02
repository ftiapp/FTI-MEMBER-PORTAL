import { Check, X } from "lucide-react";

function PasswordStrengthMeter({ password, passwordStrength, passwordCriteria }) {
  if (!password) return null;

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return <span className="text-gray-500">ยังไม่ได้กรอก</span>;
      case 1:
        return <span className="text-red-500">อ่อน (ไม่ปลอดภัย)</span>;
      case 2:
        return <span className="text-yellow-500">ปานกลาง (ไม่เพียงพอ)</span>;
      case 3:
        return <span className="text-green-500">แข็งแกร่ง</span>;
      default:
        return <span className="text-gray-500">ยังไม่ได้กรอก</span>;
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const criteria = [
    { key: "length", label: "อย่างน้อย 8 ตัวอักษร" },
    { key: "uppercase", label: "ตัวอักษรภาษาอังกฤษตัวใหญ่ (A-Z)" },
    { key: "lowercase", label: "ตัวอักษรภาษาอังกฤษตัวเล็ก (a-z)" },
    { key: "number", label: "ตัวเลข (0-9)" },
    { key: "special", label: "อักขระพิเศษ (เช่น ! @ # $ % ^ & *)" },
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">ความแข็งแกร่งของรหัสผ่าน:</span>
        <span className="text-xs font-medium">{getStrengthText()}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${(passwordStrength / 3) * 100}%` }}
        ></div>
      </div>

      {/* Password Requirements */}
      <div className="mt-3 space-y-2 text-sm">
        <p className="font-medium text-gray-700">รหัสผ่านต้องประกอบด้วย:</p>
        <ul className="space-y-1 pl-1">
          {criteria.map(({ key, label }) => (
            <li key={key} className="flex items-center">
              {passwordCriteria[key] ? (
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              )}
              <span className={passwordCriteria[key] ? "text-green-700" : "text-gray-600"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          ตัวอย่างรหัสผ่านที่ปลอดภัย: <code className="bg-gray-100 px-1 rounded">Abc123!@#</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">P@ssw0rd2023</code>
        </p>
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;
