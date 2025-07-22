'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { formatDate } from '../../product-updates/utils/formatters';

export default function MembershipRequestsManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
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
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Format date to dd/mm/yyyy
  const formatDateThai = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Get member type text (shortened for better display)
  const getMemberTypeText = (type) => {
    switch (type) {
      case 'oc':
        return 'สน';
      case 'am':
        return 'สส';
      case 'ac':
        return 'ทน';
      case 'ic':
        return 'ทบ';
      default:
        return 'อื่นๆ';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">จัดการคำขอสมาชิกใหม่</h1>
          <p className="text-blue-700">ตรวจสอบและอนุมัติคำขอสมัครสมาชิกทุกประเภท</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <div className="text-sm text-blue-600">ทั้งหมด</div>
            <div className="text-2xl font-bold text-blue-900">{applications.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <div className="text-sm text-blue-600">รอพิจารณา</div>
            <div className="text-2xl font-bold text-blue-700">
              {applications.filter(app => app.status === 0).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <div className="text-sm text-blue-600">อนุมัติแล้ว</div>
            <div className="text-2xl font-bold text-blue-800">
              {applications.filter(app => app.status === 1).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <div className="text-sm text-blue-600">ปฏิเสธแล้ว</div>
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(app => app.status === 2).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, อีเมล, เลขบัตรประชาชน..."
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-700"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="pending">รอพิจารณา</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ปฏิเสธแล้ว</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-700"
              >
                <option value="all">ทุกประเภท</option>
                <option value="oc">สน (สามัญ-โรงงาน)</option>
                <option value="am">สส (สามัญ-สมาคมการค้า)</option>
                <option value="ac">ทน (สมทบ-นิติบุคคล)</option>
                <option value="ic">ทบ (สมทบ-บุคคลธรรมดา)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-blue-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-blue-500">ไม่พบข้อมูลการสมัครสมาชิก</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                        ประเภทสมาชิก
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                        ชื่อ/บริษัท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                        เลขบัตร/เลขภาษี
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                        วันที่สมัคร
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-blue-700 uppercase">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredApplications.map((app) => (
                      <tr key={`${app.type}-${app.id}`} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                            {getMemberTypeText(app.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-blue-900 truncate" title={app.type === 'ic' 
                              ? `${app.firstNameTh || ''} ${app.lastNameTh || ''}` 
                              : app.companyNameTh || app.associationNameTh || ''}>
                              {app.type === 'ic' 
                                ? `${app.firstNameTh || ''} ${app.lastNameTh || ''}` 
                                : app.companyNameTh || app.associationNameTh || ''}
                            </div>
                            <div className="text-sm text-blue-600 truncate" title={app.type === 'ic' 
                              ? `${app.firstNameEn || ''} ${app.lastNameEn || ''}` 
                              : app.companyNameEn || app.associationNameEn || ''}>
                              {app.type === 'ic' 
                                ? `${app.firstNameEn || ''} ${app.lastNameEn || ''}` 
                                : app.companyNameEn || app.associationNameEn || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-800 font-mono">
                            {app.type === 'ic' ? app.idCard : app.taxId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-800">
                            {formatDateThai(app.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(app.status)}`}>
                            {getStatusText(app.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetails(app.type, app.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg border border-blue-600 hover:border-blue-700 whitespace-nowrap"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                  <div className="text-sm text-blue-700">
                    หน้า {currentPage} จาก {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === 1 
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                          : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      ก่อนหน้า
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === totalPages 
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                          : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}