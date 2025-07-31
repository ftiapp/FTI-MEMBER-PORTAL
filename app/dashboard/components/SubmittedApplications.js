'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function SubmittedApplications({ userId, currentPage, itemsPerPage, onPaginationChange }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [userId, currentPage, itemsPerPage]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage?.toString() || '1',
        limit: itemsPerPage?.toString() || '5'
      });
      
      const response = await fetch(`/api/membership/submitted-applications?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
        setPagination(data.pagination);
        // ส่ง pagination data กลับไปยัง parent component
        if (onPaginationChange) {
          onPaginationChange(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'รอพิจารณา', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      1: { text: 'อนุมัติ', color: 'bg-green-100 text-green-800 border-green-200' },
      2: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    return statusMap[status] || { text: 'ไม่ทราบสถานะ', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const getMemberTypeInfo = (type) => {
    const typeMap = {
      IC: { text: 'สมทบ (บุคคลธรรมดา)', color: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600' },
      OC: { text: 'สามัญ (โรงงาน)', color: 'bg-green-50 border-green-200', iconColor: 'text-green-600' },
      AC: { text: 'สมทบ (นิติบุคคล)', color: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600' },
      AM: { text: 'สามัญ (สมาคมการค้า)', color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600' }
    };
    return typeMap[type] || { text: type, color: 'bg-gray-50 border-gray-200', iconColor: 'text-gray-600' };
  };

  const openDetailPage = (application) => {
    // เปิดหน้า SummarySection ในแท็บใหม่ตามประเภทสมาชิก
    const memberTypeRoutes = {
      'IC': '/membership/ic/summary',
      'OC': '/membership/oc/summary', 
      'AC': '/membership/ac/summary',
      'AM': '/membership/am/summary'
    };
    
    const route = memberTypeRoutes[application.memberType];
    if (route) {
      // เปิดในแท็บใหม่พร้อมส่ง ID ของใบสมัคร
      window.open(`${route}?id=${application.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีเอกสารสมัครสมาชิกที่ส่งแล้ว</h3>
        <p className="text-sm text-gray-500">คุณยังไม่มีเอกสารสมัครที่ส่งไปแล้ว หรือเอกสารสมัครสมาชิกของคุณยังไม่ได้รับการพิจารณา</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app) => {
        const memberTypeInfo = getMemberTypeInfo(app.memberType);
        const statusBadge = getStatusBadge(app.status);
        
        return (
          <div key={`${app.memberType}-${app.id}`} className={`bg-white rounded-lg shadow-sm border-2 ${memberTypeInfo.color} overflow-hidden`}>
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <span className={`text-lg font-bold ${memberTypeInfo.iconColor}`}>
                      {app.memberType === 'IC' ? 'ทบ' : 
                       app.memberType === 'OC' ? 'สน' : 
                       app.memberType === 'AC' ? 'ทน' : 
                       app.memberType === 'AM' ? 'สส' : app.memberType}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {app.displayName || 'ไม่ระบุชื่อ'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {memberTypeInfo.text}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                      {statusBadge.text}
                    </div>
                    <p className="text-blue-100 text-xs mt-1">
                      ส่งเมื่อ {format(new Date(app.createdAt), 'dd MMM yyyy', { locale: th })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => openDetailPage(app)}
                    className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}