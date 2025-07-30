'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SummarySection from '@/app/membership/ic/components/SummarySection';

export default function AMSummaryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
      setError('ไม่พบรหัสเอกสารสมัครสมาชิก');
      setLoading(false);
      return;
    }

    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/membership/am/summary/${id}`);
      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดข้อมูลได้');
      }
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูล</h2>
          <p className="text-gray-600">ไม่พบข้อมูลการสมัครสมาชิก</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">สรุปข้อมูลการสมัครสมาชิก</h1>
          <p className="mt-2 text-lg text-gray-600">
            ประเภท: สามัญ (สมาคมการค้า) - {data.companyName}
          </p>
        </div>

        <SummarySection 
          memberType="AM"
          data={data}
          isViewMode={true}
        />
      </div>
    </div>
  );
}
