'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Import components
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import SettingCard from './components/SettingCard';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import SystemSettings from './components/SystemSettings';
import ApiSettings from './components/ApiSettings';
import BackupSettings from './components/BackupSettings';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('security');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminLevel, setAdminLevel] = useState(0);
  
  // Fetch settings and admin level
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin level
        const adminRes = await fetch('/api/admin/check-admin');
        const adminData = await adminRes.json();
        
        if (!adminRes.ok) {
          throw new Error(adminData.message || 'ไม่สามารถตรวจสอบสิทธิ์แอดมินได้');
        }
        
        setAdminLevel(adminData.adminLevel || 0);
        
        // Check if admin has permission to access settings - require level 5
        if (adminData.adminLevel < 5) {
          toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้าตั้งค่าระบบ เฉพาะแอดมินระดับ 5 เท่านั้น');
          router.push('/admin/dashboard');
          return;
        }
        
        // Fetch settings
        const settingsRes = await fetch('/api/admin/settings');
        const settingsData = await settingsRes.json();
        
        if (!settingsRes.ok) {
          throw new Error(settingsData.message || 'ไม่สามารถดึงข้อมูลการตั้งค่าได้');
        }
        
        setSettings(settingsData.settings);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  const handleSaveSettings = async (updatedSettings) => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: updatedSettings }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
      }
      
      setSettings(data.settings);
      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };
  
  // Settings tabs
  const tabs = [
    {
      id: 'security',
      title: 'ความปลอดภัย',
      description: 'รหัสผ่าน, เซสชัน, และการยืนยันตัวตน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      title: 'การแจ้งเตือน',
      description: 'อีเมลและการแจ้งเตือนในระบบ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'system',
      title: 'ระบบ',
      description: 'ภาษา, รูปแบบวันที่, และโหมดปิดปรับปรุง',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'api',
      title: 'API',
      description: 'การเข้าถึง API และการจำกัดอัตรา',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'backup',
      title: 'สำรองข้อมูล',
      description: 'การสำรองข้อมูลอัตโนมัติและการกู้คืน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
  ];
  
  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'security':
        return <SecuritySettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
      case 'notifications':
        return <NotificationSettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
      case 'system':
        return <SystemSettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
      case 'api':
        return <ApiSettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
      case 'backup':
        return <BackupSettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
      default:
        return <SecuritySettings settings={settings} onSave={handleSaveSettings} isLoading={saving} />;
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader title="การตั้งค่าระบบ" />
        <Toaster position="top-right" />
        
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">การตั้งค่าระบบ</h1>
            <p className="text-gray-600">จัดการการตั้งค่าระบบและการกำหนดค่าต่างๆ สำหรับแอดมิน</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">หมวดหมู่</h2>
                </div>
                <div className="p-2">
                  {tabs.map((tab) => (
                    <SettingCard
                      key={tab.id}
                      title={tab.title}
                      description={tab.description}
                      icon={tab.icon}
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    {tabs.find(tab => tab.id === activeTab)?.title || 'การตั้งค่า'}
                  </h2>
                </div>
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}