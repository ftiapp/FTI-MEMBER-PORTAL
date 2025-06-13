'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function NotificationSettings({ settings, onSave, isLoading }) {
  // Default settings if not provided
  const defaultSettings = {
    emailNotifications: true,
    adminAlerts: true,
    dailyDigest: false,
    notificationTypes: {
      newMembers: true,
      verificationRequests: true,
      profileUpdates: true,
      addressUpdates: true,
      productUpdates: true,
      contactMessages: true,
    },
  };

  const currentSettings = settings?.notifications || defaultSettings;

  const [formData, setFormData] = useState({
    emailNotifications: currentSettings.emailNotifications,
    adminAlerts: currentSettings.adminAlerts,
    dailyDigest: currentSettings.dailyDigest,
    notificationTypes: {
      newMembers: currentSettings.notificationTypes.newMembers,
      verificationRequests: currentSettings.notificationTypes.verificationRequests,
      profileUpdates: currentSettings.notificationTypes.profileUpdates,
      addressUpdates: currentSettings.notificationTypes.addressUpdates,
      productUpdates: currentSettings.notificationTypes.productUpdates,
      contactMessages: currentSettings.notificationTypes.contactMessages,
    },
  });

  // Update formData when settings change
  useEffect(() => {
    if (settings?.notifications) {
      setFormData({
        emailNotifications: settings.notifications.emailNotifications,
        adminAlerts: settings.notifications.adminAlerts,
        dailyDigest: settings.notifications.dailyDigest,
        notificationTypes: {
          newMembers: settings.notifications.notificationTypes.newMembers,
          verificationRequests: settings.notifications.notificationTypes.verificationRequests,
          profileUpdates: settings.notifications.notificationTypes.profileUpdates,
          addressUpdates: settings.notifications.notificationTypes.addressUpdates,
          productUpdates: settings.notifications.notificationTypes.productUpdates,
          contactMessages: settings.notifications.notificationTypes.contactMessages,
        },
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : e.target.value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : e.target.value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Send updated settings with notifications section
    const updatedSettings = {
      ...settings,
      notifications: formData
    };
    
    onSave(updatedSettings);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ตั้งค่าการแจ้งเตือน</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">การแจ้งเตือนทั่วไป</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                เปิดใช้งานการแจ้งเตือนทางอีเมล
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminAlerts"
                name="adminAlerts"
                checked={formData.adminAlerts}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="adminAlerts" className="ml-2 block text-sm text-gray-700">
                การแจ้งเตือนผู้ดูแลระบบ
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dailyDigest"
                name="dailyDigest"
                checked={formData.dailyDigest}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="dailyDigest" className="ml-2 block text-sm text-gray-700">
                สรุปรายงานประจำวัน
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">ประเภทการแจ้งเตือน</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newMembers"
                name="notificationTypes.newMembers"
                checked={formData.notificationTypes.newMembers}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="newMembers" className="ml-2 block text-sm text-gray-700">
                สมาชิกใหม่
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="verificationRequests"
                name="notificationTypes.verificationRequests"
                checked={formData.notificationTypes.verificationRequests}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="verificationRequests" className="ml-2 block text-sm text-gray-700">
                คำขอยืนยันตัวตน
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="profileUpdates"
                name="notificationTypes.profileUpdates"
                checked={formData.notificationTypes.profileUpdates}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="profileUpdates" className="ml-2 block text-sm text-gray-700">
                การอัปเดตโปรไฟล์
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="addressUpdates"
                name="notificationTypes.addressUpdates"
                checked={formData.notificationTypes.addressUpdates}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="addressUpdates" className="ml-2 block text-sm text-gray-700">
                การอัปเดตที่อยู่
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="productUpdates"
                name="notificationTypes.productUpdates"
                checked={formData.notificationTypes.productUpdates}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="productUpdates" className="ml-2 block text-sm text-gray-700">
                การอัปเดตผลิตภัณฑ์
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="contactMessages"
                name="notificationTypes.contactMessages"
                checked={formData.notificationTypes.contactMessages}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="contactMessages" className="ml-2 block text-sm text-gray-700">
                ข้อความติดต่อ
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