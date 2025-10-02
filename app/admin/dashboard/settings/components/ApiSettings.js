"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ApiSettings({ settings = {}, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    enableApi: settings?.enableApi || false,
    apiRateLimit: settings?.apiRateLimit || 100,
    apiKeyExpiration: settings?.apiKeyExpiration || 30,
    apiWhitelist: settings?.apiWhitelist ? settings.apiWhitelist.join("\n") : "",
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
    if (formData.enableApi) {
      if (formData.apiRateLimit < 10) {
        toast.error("จำกัดการเรียก API ต้องไม่น้อยกว่า 10 ครั้งต่อนาที");
        return;
      }

      if (formData.apiKeyExpiration < 1) {
        toast.error("อายุของ API Key ต้องไม่น้อยกว่า 1 วัน");
        return;
      }
    }

    // Process whitelist IPs
    const whitelist = formData.apiWhitelist
      .split("\n")
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    // Validate IP format (simple validation)
    const invalidIps = whitelist.filter((ip) => {
      // Simple IP validation (not perfect but catches obvious errors)
      return !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip);
    });

    if (invalidIps.length > 0) {
      toast.error(`รูปแบบ IP ไม่ถูกต้อง: ${invalidIps.join(", ")}`);
      return;
    }

    // Submit with processed data
    onSave({
      ...formData,
      apiWhitelist: whitelist,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ตั้งค่า API</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การเข้าถึง API</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableApi"
                name="enableApi"
                checked={formData.enableApi}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableApi" className="ml-2 block text-sm text-gray-700">
                เปิดใช้งาน API
              </label>
            </div>

            {formData.enableApi && (
              <>
                <div>
                  <label
                    htmlFor="apiRateLimit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    จำกัดการเรียก API
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="apiRateLimit"
                      name="apiRateLimit"
                      value={formData.apiRateLimit}
                      onChange={handleChange}
                      min="10"
                      max="1000"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="ml-2 text-gray-500 text-sm">ครั้ง/นาที</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="apiKeyExpiration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    อายุของ API Key
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="apiKeyExpiration"
                      name="apiKeyExpiration"
                      value={formData.apiKeyExpiration}
                      onChange={handleChange}
                      min="1"
                      max="365"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="ml-2 text-gray-500 text-sm">วัน</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="apiWhitelist"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    IP Whitelist (หนึ่ง IP ต่อบรรทัด)
                  </label>
                  <textarea
                    id="apiWhitelist"
                    name="apiWhitelist"
                    value={formData.apiWhitelist}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="192.168.1.1&#10;10.0.0.1/24"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    เว้นว่างไว้เพื่ออนุญาตทุก IP หรือระบุ IP แต่ละรายการในแต่ละบรรทัด (รองรับ CIDR
                    notation เช่น 192.168.1.0/24)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                API Key จะถูกเข้ารหัสก่อนจัดเก็บในฐานข้อมูล เพื่อความปลอดภัย
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
