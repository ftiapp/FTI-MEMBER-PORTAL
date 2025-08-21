'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function DraftApplications({ 
  currentPage = 1, 
  itemsPerPage = 5, // เปลี่ยน default เป็น 5
  onPageChange, 
  onTotalItemsChange 
}) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDrafts, setAllDrafts] = useState([]); // เก็บข้อมูลทั้งหมดสำหรับ pagination

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  // เมื่อ currentPage หรือ itemsPerPage เปลี่ยน ให้ทำ pagination ใหม่
  useEffect(() => {
    if (allDrafts.length > 0) {
      paginateData(allDrafts);
    }
  }, [currentPage, itemsPerPage, allDrafts]);

  // ส่ง totalItems กลับไปให้ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onTotalItemsChange) {
      onTotalItemsChange(allDrafts.length);
    }
  }, [allDrafts.length, onTotalItemsChange]);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      console.log('Fetching drafts...'); // Debug log
      
      const response = await fetch('/api/membership/get-drafts');
      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      const fetchedDrafts = data.drafts || [];
      console.log('Fetched drafts count:', fetchedDrafts.length); // Debug log
      
      setAllDrafts(fetchedDrafts);
      paginateData(fetchedDrafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('ไม่สามารถโหลดเอกสารสมัครสมาชิกที่บันทึกร่างไว้');
      setAllDrafts([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDrafts = data.slice(startIndex, endIndex);
    
    console.log('Pagination:', { 
      totalItems: data.length, 
      currentPage, 
      itemsPerPage, 
      startIndex, 
      endIndex, 
      paginatedCount: paginatedDrafts.length 
    }); // Debug log
    
    setDrafts(paginatedDrafts);
  };

  const getMemberTypeThai = (type) => {
    const typeMap = {
      'oc': 'สน',
      'ac': 'ทน',
      'ic': 'ทบ',
      'am': 'สส'
    };
    return typeMap[type] || type;
  };

  const getMemberTypeFullName = (type) => {
    const typeMap = {
      'oc': 'สมาชิกสามัญ-โรงงาน',
      'ac': 'สมาชิกสมทบ-นิติบุคคล',
      'ic': 'สมาชิกสมทบ-บุคคลธรรมดา',
      'am': 'สมาชิกสามัญ-สมาคมการค้า'
    };
    return typeMap[type] || type;
  };

  // Extract TAX ID from various possible fields in draft data
  const getDraftTaxId = (draft) => {
    const d = draft?.draftData || {};
    const val = d.taxId || d.tax_id || d.taxID || d.companyTaxId || d.vatId || d.vat_id;
    return val && String(val).trim() !== '' ? String(val) : '-';
  };

  // Extract ID Card for IC from various possible fields in draft data
  const getDraftIdCard = (draft) => {
    const d = draft?.draftData || {};
    const val = d.idCardNumber || d.id_card_number || d.idCard || d.id_card;
    return val && String(val).trim() !== '' ? String(val) : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดเอกสารสมัครที่บันทึกร่างไว้...</span>
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
          onClick={fetchDrafts}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!allDrafts || allDrafts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-600">ไม่มีเอกสารสมัครสมาชิกที่บันทึกร่างไว้</p>
          <p className="text-sm text-gray-500 mt-1">เมื่อบันทึกร่างเอกสารสมัคร จะแสดงที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูลสถิติ */}
      {allDrafts.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, allDrafts.length)}-{Math.min(currentPage * itemsPerPage, allDrafts.length)} จาก {allDrafts.length} รายการ
          </span>
          <span>หน้า {currentPage} จาก {Math.ceil(allDrafts.length / itemsPerPage)}</span>
        </div>
      )}

      {/* รายการ drafts */}
      {drafts.map((draft) => (
        <div key={`${draft.memberType}-${draft.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* เลข Tax ID หรือ ID Card ไว้ด้านบนสุด */}
              <div className="mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {draft.memberType === 'ic' ? (
                    <>
                      <span className="font-semibold">บัตรประชาชน:</span>
                      <span className="ml-1 font-mono">{getDraftIdCard(draft)}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">ทะเบียนนิติบุคคล:</span>
                      <span className="ml-1 font-mono">{getDraftTaxId(draft)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* ข้อมูลประเภทสมาชิก */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">
                    {getMemberTypeThai(draft.memberType)} - {getMemberTypeFullName(draft.memberType)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ขั้นตอนที่ {draft.currentStep} จากทั้งหมด 5 ขั้นตอน
                  </p>
                </div>
              </div>

              {/* วันที่อัปเดต */}
              <div className="ml-11">
                <p className="text-xs text-gray-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  อัปเดตล่าสุด: {formatDate(draft.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 ml-4">
              <Link
                href={`/membership/${draft.memberType}?draftId=${draft.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
              >
                ดำเนินการต่อ
              </Link>
              
              {/* แสดง progress bar */}
              {draft.currentStep && (
                <div className="w-28">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">ความคืบหน้า</span>
                    <span className="font-bold text-blue-600">{Math.round((draft.currentStep / 5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm" 
                      style={{ width: `${(draft.currentStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* หากไม่มีข้อมูลในหน้านี้ แต่มีข้อมูลรวม */}
      {drafts.length === 0 && allDrafts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่มีข้อมูลในหน้านี้</p>
          <button
            onClick={() => onPageChange && onPageChange(1)}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            กลับไปหน้าแรก
          </button>
        </div>
      )}
    </div>
  );
}