'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DraftApplications from './DraftApplications';
import SubmittedApplications from './SubmittedApplications';
import RejectedApplications from './RejectedApplications';
import ApplicationsList from '../../components/member/ApplicationsList';
import ApplicationDetailView from './ApplicationDetailView';

export default function MembershipDocuments() {
  const [activeSection, setActiveSection] = useState('drafts');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [submittedPagination, setSubmittedPagination] = useState(null);
  const itemsPerPage = 5;
  const searchParams = useSearchParams();
  const detail = searchParams.get('detail');

  // ดึงจำนวนรายการจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/membership/count?type=${activeSection}`);
        if (response.ok) {
          const data = await response.json();
          setTotalItems(data.count || 0);
        } else {
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error fetching count:', error);
        setTotalItems(0);
      }
    };
    fetchData();
  }, [activeSection]);

  const handleTabChange = (section) => {
    setActiveSection(section);
    setCurrentPage(1);
  };

  // Simple Pagination Component
  const SimplePagination = ({ totalItems, currentPage, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          หน้า {currentPage} จาก {totalPages} ({totalItems} รายการ)
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>ก่อนหน้า</span>
          </button>
          
          <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            {currentPage}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>ถัดไป</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // If detail parameter exists, show detail view
  if (detail) {
    return <ApplicationDetailView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => handleTabChange('drafts')}
                className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === 'drafts'
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">เอกสารสมัครสมาชิกที่ยังไม่ส่ง</span>
                <span className="sm:hidden">ยังไม่ส่ง</span>
              </button>
              
              <button
                onClick={() => handleTabChange('rejected')}
                className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === 'rejected'
                    ? 'text-red-600 border-b-2 border-red-500 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">เอกสารรอการแก้ไข</span>
                <span className="sm:hidden">รอแก้ไข</span>
              </button>
              
              <button
                onClick={() => handleTabChange('completed')}
                className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === 'completed'
                    ? 'text-green-600 border-b-2 border-green-500 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">เอกสารสมัครสมาชิกที่ส่งแล้ว</span>
                <span className="sm:hidden">ส่งแล้ว</span>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeSection === 'drafts' ? (
              <div>
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">เอกสารสมัครสมาชิกที่ยังไม่ส่ง</h2>
                    <p className="text-gray-600 text-sm mt-1">เอกสารสมัครสมาชิกที่ยังกรอกไม่เสร็จ สามารถแก้ไขและส่งได้</p>
                  </div>
                </div>
                
                <DraftApplications 
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
                
                <SimplePagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : activeSection === 'rejected' ? (
              <div>
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">เอกสารรอการแก้ไข</h2>
                    <p className="text-gray-600 text-sm mt-1">เอกสารสมัครสมาชิกที่ถูกปฏิเสธ สามารถแก้ไขและส่งใหม่ได้</p>
                  </div>
                </div>
                
                <RejectedApplications 
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
                
                <SimplePagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">เอกสารสมัครสมาชิกที่ส่งแล้ว</h2>
                    <p className="text-gray-600 text-sm mt-1">เอกสารสมัครสมาชิกที่ส่งไปแล้ว พร้อมสถานะการตรวจสอบ</p>
                  </div>
                </div>
                
                <SubmittedApplications 
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPaginationChange={setSubmittedPagination}
                />
                
                <SimplePagination
                  totalItems={submittedPagination?.totalItems || 0}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">ต้องการความช่วยเหลือ?</h3>
                <p className="text-gray-600 text-sm">หากมีปัญหาหรือสงสัยเรื่องการสมัครสมาชิก</p>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>ติดต่อเรา</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}