"use client";

export default function StepWorkflow() {
  const steps = [
    {
      number: 1,
      title: "สมาชิกสมัครผ่านระบบออนไลน์",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2M16 11h6m-3-3v6"
          />
        </svg>
      ),
    },
    {
      number: 2,
      title: "เจ้าหน้าที่ตรวจสอบข้อมูล และรับใบแจ้งหนี้ผ่านอีเมล",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      number: 3,
      title: "ชำระเงิน",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
          <path d="M2 10h20" strokeWidth="2" />
        </svg>
      ),
    },
    {
      number: 4,
      title: "รอรับจดหมายยืนยันทางไปรษณีย์",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h3 className="text-xl font-bold text-blue-900 mb-4">ขั้นตอนการสมัคร</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center md:flex-1">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                {step.icon}
              </div>
              <div>
                <p className="text-sm text-blue-500">ขั้นตอนที่ {step.number}</p>
                <p className="font-medium text-blue-900">{step.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
