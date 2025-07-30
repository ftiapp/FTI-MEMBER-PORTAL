'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SummarySection from '../components/SummarySection';

export default function ICSummaryPage() {
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  useEffect(() => {
    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/ic/summary/${applicationId}`);
      const data = await response.json();
      
      if (data.success) {
        setApplicationData(data.data);
      } else {
        setError(data.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error('Error fetching application data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.close()} 
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ไม่พบข้อมูลใบสมัคร</p>
          <button 
            onClick={() => window.close()} 
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                รายละเอียดใบสมัครสมาชิก IC (สมทบ-บุคคลธรรมดา)
              </h1>
              <button 
                onClick={() => window.close()} 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <SummarySection 
              formData={applicationData}
              industrialGroups={applicationData.industrialGroups || []}
              provincialChapters={applicationData.provincialChapters || []}
              viewMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
