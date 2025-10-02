"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function SystemSettings({ settings = {}, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    maintenanceMode: settings?.maintenanceMode || false,
    maintenanceMessage: settings?.maintenanceMessage || "",
    systemLanguage: settings?.systemLanguage || "th",
    dateFormat: settings?.dateFormat || "DD/MM/YYYY",
    timeFormat: settings?.timeFormat || "HH:mm",
    timezone: settings?.timezone || "Asia/Bangkok",
    debugMode: settings?.debugMode || false,
    logLevel: settings?.logLevel || "error",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.maintenanceMode && !formData.maintenanceMessage.trim()) {
      toast.error("กรุณาระบุข้อความแจ้งเตือนการปิดปรับปรุงระบบ");
      return;
    }

    onSave(formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ตั้งค่าระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การเข้าถึงระบบ</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                เปิดโหมดปิดปรับปรุงระบบ
              </label>
            </div>

            {formData.maintenanceMode && (
              <div>
                <label
                  htmlFor="maintenanceMessage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ข้อความแจ้งเตือนการปิดปรับปรุงระบบ
                </label>
                <textarea
                  id="maintenanceMessage"
                  name="maintenanceMessage"
                  value={formData.maintenanceMessage}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาใหม่ในภายหลัง"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="debugMode"
                name="debugMode"
                checked={formData.debugMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700">
                เปิดโหมดดีบัก (Debug Mode)
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การตั้งค่าภาษาและเวลา</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label
                htmlFor="systemLanguage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ภาษาหลักของระบบ
              </label>
              <select
                id="systemLanguage"
                name="systemLanguage"
                value={formData.systemLanguage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="th">ไทย (Thai)</option>
                <option value="en">อังกฤษ (English)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                รูปแบบวันที่
              </label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                <option value="DD MMMM YYYY">DD MMMM YYYY (31 ธันวาคม 2023)</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-1">
                รูปแบบเวลา
              </label>
              <select
                id="timeFormat"
                name="timeFormat"
                value={formData.timeFormat}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="HH:mm">24 ชั่วโมง (14:30)</option>
                <option value="hh:mm A">12 ชั่วโมง (02:30 PM)</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                เขตเวลา
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Asia/Bangkok">เอเชีย/กรุงเทพฯ (GMT+7)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Tokyo">เอเชีย/โตเกียว (GMT+9)</option>
                <option value="America/New_York">อเมริกา/นิวยอร์ก (GMT-5)</option>
                <option value="Europe/London">ยุโรป/ลอนดอน (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การบันทึกล็อก</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 mb-1">
                ระดับการบันทึกล็อก
              </label>
              <select
                id="logLevel"
                name="logLevel"
                value={formData.logLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="error">Error เท่านั้น</option>
                <option value="warn">Warning และ Error</option>
                <option value="info">Info, Warning และ Error</option>
                <option value="debug">Debug, Info, Warning และ Error</option>
                <option value="trace">ทั้งหมด (Trace)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                ระดับการบันทึกล็อกที่สูงขึ้นจะใช้พื���นที่เก็บข้อมูลมากขึ้น
                แต่จะช่วยในการแก้ไขปัญหาได้ดีขึ้น
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                การเปิดโหมดปิดปรับปรุงระบบจะทำให้ผู้ใช้ทั่วไปไม่สามารถเข้าถึงระบบได้
                ยกเว้นผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกการตั้งค่า"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
