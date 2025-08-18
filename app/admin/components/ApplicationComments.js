'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function ApplicationComments({ membershipType, membershipId }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (membershipType && membershipId) {
      fetchComments();
    }
  }, [membershipType, membershipId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/membership/comments/${membershipType}/${membershipId}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
      } else {
        setError(result.message || 'ไม่สามารถดึงประวัติความเห็นได้');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const getCommentTypeInfo = (type) => {
    const types = {
      'admin_rejection': {
        label: 'ปฏิเสธโดยแอดมิน',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        icon: '❌'
      },
      'admin_note': {
        label: 'ความเห็นแอดมิน',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        icon: '📝'
      },
      'user_resubmit': {
        label: 'ผู้ใช้ส่งใบสมัครใหม่',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: '🔄'
      },
      'admin_approval': {
        label: 'อนุมัติโดยแอดมิน',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: '✅'
      },
      'system_note': {
        label: 'หมายเหตุระบบ',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        icon: '🔧'
      }
    };

    return types[type] || types['system_note'];
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: th });
    } catch {
      return dateString;
    }
  };

    const renderDataChanges = (dataChanges) => {
    if (!dataChanges) return null;

    try {
      const changes = typeof dataChanges === 'string' ? JSON.parse(dataChanges) : dataChanges;
      const fieldLabels = {
        companyName: 'ชื่อบริษัท (ไทย)',
        companyNameEn: 'ชื่อบริษัท (อังกฤษ)',
        taxId: 'เลขประจำตัวผู้เสียภาษี',
        companyEmail: 'อีเมลบริษัท',
        companyPhone: 'โทรศัพท์บริษัท',
        companyPhoneExtension: 'เบอร์ต่อ',
        companyWebsite: 'เว็บไซต์',
        numberOfEmployees: 'จำนวนพนักงาน',
        registeredCapital: 'ทุนจดทะเบียน',
        productionCapacityValue: 'กำลังการผลิต (มูลค่า)',
        productionCapacityUnit: 'กำลังการผลิต (หน่วย)',
        salesDomestic: 'ยอดขายในประเทศ',
        salesExport: 'ยอดขายส่งออก',
        shareholderThaiPercent: 'สัดส่วนผู้ถือหุ้น (ไทย)',
        shareholderForeignPercent: 'สัดส่วนผู้ถือหุ้น (ต่างชาติ)',
        addresses: 'ที่อยู่',
        contactPersons: 'ผู้ให้ข้อมูล',
        representatives: 'ผู้แทน',
        businessTypes: 'ประเภทธุรกิจ',
        otherBusinessTypeDetail: 'รายละเอียดประเภทธุรกิจอื่นๆ',
        products: 'ผลิตภัณฑ์',
        industrialGroups: 'กลุ่มอุตสาหกรรม',
        provincialChapters: 'สภาอุตสาหกรรมจังหวัด',
        userComment: 'ข้อความจากผู้ใช้',
      };

      const formatValue = (key, value) => {
        if (Array.isArray(value)) {
          if (value.length === 0) return 'ไม่มี';
          if (typeof value[0] === 'object' && value[0] !== null) {
            return `${value.length} รายการ`;
          } 
          return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
          return `${Object.keys(value).length} รายการ`;
        }
        if (typeof value === 'boolean') {
          return value ? 'ใช่' : 'ไม่ใช่';
        }
        return value || 'ไม่มีข้อมูล';
      };

      const changeEntries = Object.entries(changes).filter(([key]) => fieldLabels[key]);

      if (changeEntries.length === 0) {
        return (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">ผู้ใช้ส่งใบสมัครใหม่โดยไม่มีการแก้ไขข้อมูล</p>
          </div>
        );
      }

      return (
        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-800 mb-3">ข้อมูลที่ผู้ใช้แก้ไข:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-700">
            {changeEntries.map(([key, value]) => (
              <li key={key} className="flex">
                <span className="font-medium w-1/2">{fieldLabels[key]}:</span>
                <span className="w-1/2 text-gray-600">{formatValue(key, value)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (e) {
      console.error("Error rendering data changes:", e);
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">ไม่สามารถแสดงข้อมูลที่เปลี่ยนแปลงได้</p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติความเห็นและการแก้ไข</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดประวัติ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติความเห็นและการแก้ไข</h3>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchComments}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">ประวัติความเห็นและการแก้ไข</h3>
        <button 
          onClick={fetchComments}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500">ยังไม่มีประวัติความเห็นหรือการแก้ไข</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const typeInfo = getCommentTypeInfo(comment.comment_type);
            
            return (
              <div
                key={comment.id}
                className={`${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-lg p-4`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{typeInfo.icon}</span>
                    <span className={`font-medium ${typeInfo.textColor}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-700">
                    <strong>โดย:</strong> {
                      comment.admin_name ? 
                        `${comment.admin_name} (${comment.admin_username})` : 
                        comment.user_name ? 
                          `${comment.user_name} (${comment.user_email})` : 
                          'ระบบ'
                    }
                  </p>
                </div>

                <div className="text-sm text-gray-800">
                  <p>{comment.comment_text}</p>
                </div>

                {comment.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-1">เหตุผลการปฏิเสธ:</p>
                    <p className="text-sm text-red-700">{comment.rejection_reason}</p>
                  </div>
                )}

                {comment.comment_type !== 'user_resubmit' && comment.data_changes && renderDataChanges(comment.data_changes)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
