'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SecuritySettings({ settings = {}, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    passwordPolicy: {
      minLength: settings?.passwordPolicy?.minLength || 8,
      requireUppercase: settings?.passwordPolicy?.requireUppercase || true,
      requireNumbers: settings?.passwordPolicy?.requireNumbers || true,
      requireSpecialChars: settings?.passwordPolicy?.requireSpecialChars || false,
    },
    sessionTimeout: settings?.sessionTimeout || 30,
    maxLoginAttempts: settings?.maxLoginAttempts || 5,
    twoFactorAuth: settings?.twoFactorAuth || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.passwordPolicy.minLength < 6) {
      toast.error('ความยาวรหัสผ่านขั้นต่ำต้องไม่น้อยกว่า 6 ตัวอักษร');
      return;
    }
    
    if (formData.sessionTimeout < 15) {
      toast.error('เวลาหมดอายุของเซสชันต้องไม่น้อยกว่า 15 นาที');
      return;
    }
    
    if (formData.maxLoginAttempts < 3 || formData.maxLoginAttempts > 10) {
      toast.error('จำนวนครั้งที่ล็อกอินผิดพลาดสูงสุดต้องอยู่ระหว่าง 3 ถึง 10 ครั้ง');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ตั้งค่าความปลอดภัย</h2>
      <form onSubmit={handleSubmit}>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                การเปลี่ยนแปลงการตั้งค่าความปลอดภัยอาจส่งผลกระทบต่อผู้ใช้งานทั้งหมดในระบบ โปรดตรวจสอบให้แน่ใจก่อนบันทึกการเปลี่ยนแปลง
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">นโยบายรหัสผ่าน</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความยาวรหัสผ่านขั้นต่ำ
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="passwordPolicy.minLength"
                  value={formData.passwordPolicy.minLength}
                  onChange={handleChange}
                  min="6"
                  max="20"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="ml-2 text-gray-500 text-sm">ตัวอักษร</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireUppercase"
                name="passwordPolicy.requireUppercase"
                checked={formData.passwordPolicy.requireUppercase}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700">
                ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireNumbers"
                name="passwordPolicy.requireNumbers"
                checked={formData.passwordPolicy.requireNumbers}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-700">
                ต้องมีตัวเลขอย่างน้อย 1 ตัว
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireSpecialChars"
                name="passwordPolicy.requireSpecialChars"
                checked={formData.passwordPolicy.requireSpecialChars}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-700">
                ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (เช่น @, #, $, %)
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การตั้งค่าเซสชัน</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เวลาหมดอายุของเซสชัน
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="sessionTimeout"
                  value={formData.sessionTimeout}
                  onChange={handleChange}
                  min="15"
                  max="1440"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="ml-2 text-gray-500 text-sm">นาที</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                ระยะเวลาที่ผู้ใช้ไม่มีการใช้งานระบบก่อนที่จะถูกออกจากระบบโดยอัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การล็อกอิน</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนครั้งที่ล็อกอินผิดพลาดสูงสุด
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={formData.maxLoginAttempts}
                  onChange={handleChange}
                  min="3"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <span className="ml-2 text-gray-500 text-sm">ครั้ง</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                จำนวนครั้งที่ผู้ใช้สามารถล็อกอินผิดพลาดก่อนที่บัญชีจะถูกล็อค
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorAuth"
                name="twoFactorAuth"
                checked={formData.twoFactorAuth}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                เปิดใช้งานการยืนยันตัวตนสองชั้น (OTP ทางอีเมล)
              </label>
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการตั้งค่า'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
