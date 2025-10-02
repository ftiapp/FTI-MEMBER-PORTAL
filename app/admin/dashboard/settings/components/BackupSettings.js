"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function BackupSettings({ settings = {}, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    autoBackup: settings?.autoBackup || false,
    backupFrequency: settings?.backupFrequency || "daily",
    backupTime: settings?.backupTime || "03:00",
    retentionPeriod: settings?.retentionPeriod || 30,
    backupLocation: settings?.backupLocation || "local",
    includeUploads: settings?.includeUploads || true,
    backupNotification: settings?.backupNotification || true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (formData.autoBackup) {
      if (formData.retentionPeriod < 1) {
        toast.error("ระยะเวลาการเก็บรักษาข้อมูลสำรองต้องไม่น้อยกว่า 1 วัน");
        return;
      }
    }

    onSave(formData);
  };

  const handleManualBackup = () => {
    toast.success("เริ่มการสำรองข้อมูลแล้ว กรุณารอสักครู่...");
    // In a real implementation, this would call an API endpoint to trigger a backup
    setTimeout(() => {
      toast.success("สำรองข้อมูลเรียบร้อยแล้ว");
    }, 3000);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ตั้งค่าการสำรองข้อมูล</h2>

      <div className="mb-6">
        <button
          type="button"
          onClick={handleManualBackup}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          สำรองข้อมูลทันที
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การสำรองข้อมูลอัตโนมัติ</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBackup"
                name="autoBackup"
                checked={formData.autoBackup}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-700">
                เปิดใช้งานการสำรองข้อมูลอัตโนมัติ
              </label>
            </div>

            {formData.autoBackup && (
              <>
                <div>
                  <label
                    htmlFor="backupFrequency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ความถี่ในการสำรองข้อมูล
                  </label>
                  <select
                    id="backupFrequency"
                    name="backupFrequency"
                    value={formData.backupFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="daily">รายวัน</option>
                    <option value="weekly">รายสัปดาห์</option>
                    <option value="monthly">รายเดือน</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="backupTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เวลาที่ทำการสำรองข้อมูล
                  </label>
                  <input
                    type="time"
                    id="backupTime"
                    name="backupTime"
                    value={formData.backupTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    แนะนำให้ตั้งเวลาในช่วงที่มีการใช้งานระบบน้อย เช่น กลางคืน
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="retentionPeriod"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ระยะเวลาการเก็บรักษาข้อมูลสำรอง
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="retentionPeriod"
                      name="retentionPeriod"
                      value={formData.retentionPeriod}
                      onChange={handleChange}
                      min="1"
                      max="365"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="ml-2 text-gray-500 text-sm">วัน</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    ข้อมูลสำรองที่เก่ากว่าระยะเวลานี้จะถูกลบโดยอัตโนมัติ
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">ตัวเลือกการสำรองข้อมูล</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label
                htmlFor="backupLocation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ตำแหน่งที่เก็บข้อมูลสำรอง
              </label>
              <select
                id="backupLocation"
                name="backupLocation"
                value={formData.backupLocation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="local">เซิร์ฟเวอร์ท้องถิ่น</option>
                <option value="s3">Amazon S3</option>
                <option value="gcs">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeUploads"
                name="includeUploads"
                checked={formData.includeUploads}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeUploads" className="ml-2 block text-sm text-gray-700">
                รวมไฟล์อัปโหลดในการสำรองข้อมูล
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupNotification"
                name="backupNotification"
                checked={formData.backupNotification}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="backupNotification" className="ml-2 block text-sm text-gray-700">
                ส่งการแจ้งเตือนเมื่อสำรองข้อมูลเสร็จสิ้น
              </label>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                การสำรองข้อมูลอาจใช้ทรัพยากรของเซิร์ฟเวอร์มาก
                แนะนำให้ตั้งเวลาในช่วงที่มีการใช้งานระบบน้อย
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
