'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { formatDate } from '../../product-updates/utils/formatters';

/**
 * Membership Requests Management Page
 * 
 * This page allows administrators to view and manage all types of membership applications.
 * Administrators can:
 * - View all membership applications (OC, AM, AC, IC)
 * - Filter applications by status (pending, approved, rejected)
 * - Filter applications by type (OC, AM, AC, IC)
 * - View details of each application
 * - Approve or reject applications
 * - Add admin notes
 * - Print application details
 */

export default function MembershipRequestsManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'oc', 'am', 'ac', 'ic'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch membership applications
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/membership-requests?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}&type=${typeFilter}&search=${searchTerm}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        if (data.success) {
          setApplications(data.data || []);
          setFilteredApplications(data.data || []);
          setTotalPages(Math.ceil(data.pagination?.total / itemsPerPage) || 1);
        } else {
          toast.error(data.message || 'ไม่สามารถดึงข้อมูลการสมัครสมาชิกได้');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('ไม่สามารถดึงข้อมูลการสมัครสมาชิกได้');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [currentPage, itemsPerPage, statusFilter, typeFilter, searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  // Handle type filter change
  const handleTypeFilterChange = (newFilter) => {
    setTypeFilter(newFilter);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle view application details
  const handleViewDetails = (applicationType, applicationId) => {
    router.push(`/admin/dashboard/membership-requests/${applicationType}/${applicationId}`);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 1:
        return 'bg-green-100 text-green-800 border-green-300';
      case 2:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'รอพิจารณา';
      case 1:
        return 'อนุมัติแล้ว';
      case 2:
        return 'ปฏิเสธแล้ว';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  // Get member type text
  const getMemberTypeText = (type) => {
    switch (type) {
      case 'oc':
        return 'สน (สามัญ-โรงงาน)';
      case 'am':
        return 'สส (สามัญ-สมาคมการค้า)';
      case 'ac':
        return 'ทน (สมทบ-นิติบุคคล)';
      case 'ic':
        return 'ทบ (สมทบ-บุคคลธรรมดา)';
      default:
        return 'ไม่ทราบประเภท';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">จัดการคำขอสมาชิกใหม่</h1>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            {/* Status Filter */}
            <div className="flex space-x-2 mb-4 md:mb-0">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => handleStatusFilterChange('pending')}
                className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                รออนุมัติ
              </button>
              <button
                onClick={() => handleStatusFilterChange('approved')}
                className={`px-4 py-2 rounded-md ${statusFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                อนุมัติ
              </button>
              <button
                onClick={() => handleStatusFilterChange('rejected')}
                className={`px-4 py-2 rounded-md ${statusFilter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ปฏิเสธ
              </button>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อ, อีเมล, เลขบัตรประชาชน..."
                  className="w-full md:w-80 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTypeFilterChange('all')}
              className={`px-4 py-2 rounded-md ${typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ทุกประเภท
            </button>
            <button
              onClick={() => handleTypeFilterChange('oc')}
              className={`px-4 py-2 rounded-md ${typeFilter === 'oc' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              สน (สามัญ-โรงงาน)
            </button>
            <button
              onClick={() => handleTypeFilterChange('am')}
              className={`px-4 py-2 rounded-md ${typeFilter === 'am' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              สส (สามัญ-สมาคมการค้า)
            </button>
            <button
              onClick={() => handleTypeFilterChange('ac')}
              className={`px-4 py-2 rounded-md ${typeFilter === 'ac' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ทน (สมทบ-นิติบุคคล)
            </button>
            <button
              onClick={() => handleTypeFilterChange('ic')}
              className={`px-4 py-2 rounded-md ${typeFilter === 'ic' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ทบ (สมทบ-บุคคลธรรมดา)
            </button>
          </div>
        </div>
        
        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภทสมาชิก
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ/บริษัท
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เลขบัตร/เลขภาษี
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังโหลดข้อมูล...
                      </div>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      ไม่พบข้อมูลการสมัครสมาชิก
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={`${app.type}-${app.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getMemberTypeText(app.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.type === 'ic' 
                            ? `${app.firstNameTh || ''} ${app.lastNameTh || ''}` 
                            : app.companyNameTh || app.associationNameTh || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.type === 'ic' 
                            ? `${app.firstNameEn || ''} ${app.lastNameEn || ''}` 
                            : app.companyNameEn || app.associationNameEn || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {app.type === 'ic' ? app.idCard : app.taxId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(app.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(app.type, app.id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  หน้า <span className="font-medium">{currentPage}</span> จาก <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
