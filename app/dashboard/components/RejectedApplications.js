'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RejectedApplications({ currentPage, itemsPerPage }) {
  const [rejectedApps, setRejectedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchRejectedApplications();
  }, [currentPage, itemsPerPage]);

  const fetchRejectedApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/membership/rejected-applications?page=${currentPage}&limit=${itemsPerPage}`);
      const result = await response.json();

      if (result.success) {
        setRejectedApps(result.data);
        setTotalItems(result.pagination.totalItems);
      } else {
        setError(result.message || 'Failed to fetch rejected applications');
      }
    } catch (error) {
      console.error('Error fetching rejected applications:', error);
      setError('Failed to fetch rejected applications');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplication = (app) => {
    // Navigate to edit page with rejection data
    router.push(`/membership/rejected/${app.id}/edit`);
  };

  const handleCancelApplication = async (app) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกใบสมัครนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      const response = await fetch(`/api/membership/rejected-applications/${app.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('ยกเลิกใบสมัครเรียบร้อยแล้ว');
        fetchRejectedApplications(); // Refresh the list
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      console.error('Error cancelling application:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกใบสมัคร');
    }
  };

  const getMembershipTypeLabel = (type) => {
    const labels = {
      'oc': 'สามัญ-โรงงาน (OC)',
      'ac': 'สมทบ-นิติบุคคล (AC)', 
      'am': 'สามัญ-สมาคมการค้า (AM)',
      'ic': 'สมทบ-บุคคลธรรมดา (IC)'
    };
    return labels[type] || type.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchRejectedApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (rejectedApps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-600">ไม่มีเอกสารที่รอการแก้ไข</p>
          <p className="text-sm text-gray-500 mt-1">เมื่อมีใบสมัครที่ถูกปฏิเสธ จะแสดงที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rejectedApps.map((app) => (
        <div key={app.id} className="bg-white border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.application_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getMembershipTypeLabel(app.membership_type)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">เลขประจำตัว:</p>
                    <p className="text-sm text-gray-600">{app.identifier}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">วันที่ปฏิเสธ:</p>
                    <p className="text-sm text-gray-600">{formatDate(app.created_at)}</p>
                  </div>
                </div>

                {app.rejection_reason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">เหตุผลการปฏิเสธ:</p>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{app.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {app.admin_note && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">ความเห็นของผู้ดูแลระบบ:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">{app.admin_note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleCancelApplication(app)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                ยกเลิกใบสมัคร
              </button>
              <button
                onClick={() => handleEditApplication(app)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                แก้ไขและส่งใหม่
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
