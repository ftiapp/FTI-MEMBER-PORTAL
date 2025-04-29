'use client';

import { useState, useEffect } from 'react';

/**
 * ActionCounts Component
 * 
 * Displays counts of each action type from Member_portal_User_log as cards
 */
export default function ActionCounts({ title }) {
  const [actionCounts, setActionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action type translations and icons
  const actionInfo = {
    member_verification: {
      title: 'ยืนยันตัวสมาชิกเดิม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    document_upload: {
      title: 'อัปโหลดเอกสาร',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    profile_update: {
      title: 'อัปเดตโปรไฟล์',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    profile_update_request: {
      title: 'คำขอแก้ไขโปรไฟล์',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    contact_message: {
      title: 'ข้อความติดต่อ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    change_email: {
      title: 'เปลี่ยนอีเมล',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    password_reset: {
      title: 'รีเซ็ตรหัสผ่าน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    other: {
      title: 'อื่นๆ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    }
  };

  useEffect(() => {
    const fetchActionCounts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/action-counts', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch action counts');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setActionCounts(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch action counts');
        }
      } catch (err) {
        console.error('Error fetching action counts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActionCounts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title || 'สถิติการดำเนินการ'}</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title || 'สถิติการดำเนินการ'}</h2>
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title || 'สถิติการดำเนินการ'}</h2>
      
      {Object.keys(actionCounts).length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
          <p>ไม่พบข้อมูลการดำเนินการ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(actionCounts).map(([action, count]) => {
            const info = actionInfo[action] || actionInfo.other;
            
            return (
              <div key={action} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${info.bgColor} p-3 rounded-full`}>
                    {info.icon}
                  </div>
                  <p className={`text-3xl font-bold ${info.textColor}`}>{count}</p>
                </div>
                <p className="text-lg font-semibold text-gray-700">{info.title}</p>
                <p className="text-sm text-gray-500">{action}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
