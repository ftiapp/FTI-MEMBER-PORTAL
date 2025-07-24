'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ApplicationsList({ type = 'completed' }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, [type]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/member/get-applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      console.log('Fetched applications:', data.applications);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('ไม่สามารถดึงข้อมูลการสมัครได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'รอพิจารณา',
      1: 'อนุมัติ',
      2: 'ปฏิเสธ'
    };
    return statusMap[status] || 'ไม่ระบุ';
  };

  const handleViewDetail = (application) => {
    // Navigate to detail view
    router.push(`/dashboard?tab=documents&detail=${application.id}&type=${application.member_type}`);
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'text-yellow-600 bg-yellow-100',
      1: 'text-green-600 bg-green-100',
      2: 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {type === 'completed' ? 'ยังไม่มีการสมัครที่เสร็จสมบูรณ์' : 'ยังไม่มีร่างการสมัคร'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {loading ? 'กำลังโหลด...' : 'ยังไม่มีการสมัครที่เสร็จสมบูรณ์'}
          </p>
          {applications.length === 0 && !loading && (
            <p className="text-sm text-gray-400 mt-2">
              หากคุณมีการสมัครที่เสร็จสมบูรณ์แล้ว จะแสดงที่นี่
            </p>
          )}
        </div>
      ) : (
        applications.map((application) => (
          <div key={application.id} className="bg-white shadow rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewDetail(application)}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.company_name || 'ไม่ระบุชื่อบริษัท'}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">ประเภท:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {application.member_type_th || application.member_type}
                  </span>
                </div>
                {application.tax_id && (
                  <div className="text-sm text-gray-600">
                    เลขประจำตัวผู้เสียภาษี: {application.tax_id}
                  </div>
                )}
                {application.member_code && (
                  <div className="text-sm text-green-600">
                    หมายเลขสมาชิก: {application.member_code}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(application.created_at).toLocaleDateString('th-TH')}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  คลิกเพื่อดูรายละเอียด
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
