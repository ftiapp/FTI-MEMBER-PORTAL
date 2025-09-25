'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to map member types to Thai abbreviations
const getMemberTypeAbbr = (type) => {
  switch(type) {
    case 'OC': return 'สน';
    case 'IC': return 'ทบ';
    case 'AM': return 'สส';
    case 'AC': return 'ทน';
    default: return type || '';
  }
};

// Utility to format dates in Thai locale with timezone handling
const formatThaiDate = (value) => {
  if (!value) return '-';

  const parseDate = (raw) => {
    if (raw instanceof Date) {
      return Number.isNaN(raw.getTime()) ? null : raw;
    }

    if (typeof raw === 'number') {
      const ts = raw > 1e12 ? raw : raw * 1000;
      const date = new Date(ts);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof raw !== 'string') {
      return null;
    }

    let normalized = raw.trim();
    if (!normalized) return null;

    if (/^\d+$/.test(normalized)) {
      const numeric = Number(normalized);
      const date = new Date(normalized.length > 10 ? numeric : numeric * 1000);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (/^\d{4}-\d{2}-\d{2}\s/.test(normalized)) {
      normalized = normalized.replace(' ', 'T');
    }

    if (/\.\d{4,}$/.test(normalized)) {
      normalized = normalized.replace(/\.(\d{3})\d+/, '.$1');
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?$/.test(normalized)) {
      normalized = `${normalized}+07:00`;
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    const utcParsed = new Date(`${normalized.endsWith('Z') ? normalized : `${normalized}Z`}`);
    return Number.isNaN(utcParsed.getTime()) ? null : utcParsed;
  };

  const date = parseDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }).format(date);
};

// Loading Overlay Component
function LoadingOverlay({ isOpen, text = 'กำลังเชื่อมต่อฐานข้อมูล...' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl text-center">
        <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="mt-3 text-gray-800 font-medium">{text}</div>
      </div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose, memberCode, companyName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center mb-4">
          <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">เชื่อมต่อเรียบร้อยแล้ว</h3>
        </div>
        <div className="space-y-2 text-gray-800">
          <div><span className="font-bold">หมายเลขสมาชิก:</span> {memberCode}</div>
          <div><span className="font-bold">ชื่อบริษัท:</span> {companyName}</div>
          <div className="text-sm text-gray-600 mt-2">
            กรุณาแจ้งผู้ใช้งานให้ตรวจสอบในระบบของผู้ใช้งาน ที่เมนู <span className="font-semibold">ข้อมูลสมาชิก</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">ปิด</button>
        </div>
      </div>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onClose, onConfirm, member, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              ยืนยันการเชื่อมต่อ
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700">
            คุณต้องการเชื่อมต่อหมายเลขสมาชิกสำหรับ
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {member?.company_name_th}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            เลขประจำตัวผู้เสียภาษี: {member?.tax_id}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเชื่อมต่อ...
              </>
            ) : (
              'ยืนยัน'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConnectDatabasePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingOverlayOpen, setLoadingOverlayOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ open: false, memberCode: '', companyName: '' });
  // Connected tab states
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'connected'
  const [connected, setConnected] = useState([]);
  const [connectedLoading, setConnectedLoading] = useState(false);
  const [connectedError, setConnectedError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  // Pending search and connected count
  const [pendingSearch, setPendingSearch] = useState('');
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    fetchApprovedMembers();
    // prefetch connected count for cards
    fetchConnectedMembers({ page: 1, limit: 1 }).then(() => {
      setConnectedCount((prev) => pagination.total || prev);
    });
  }, []);

  const fetchApprovedMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/connect-database/list', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved members');
      }
      
      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  // Fetch connected members with search/pagination
  const fetchConnectedMembers = async (opts = {}) => {
    const { page = pagination.page, limit = pagination.limit, q = search } = opts;
    try {
      setConnectedLoading(true);
      setConnectedError(null);
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if ((q || '').trim() !== '') params.set('search', q.trim());
      const res = await fetch(`/api/admin/connect-database/connected?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch connected members');
      setConnected(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 });
      if (data.pagination?.total != null) setConnectedCount(data.pagination.total);
    } catch (e) {
      setConnectedError(e.message);
    } finally {
      setConnectedLoading(false);
    }
  };

  const handleConfirmConnect = async () => {
    if (!selectedMember) return;
    
    setConnecting(prev => ({ ...prev, [selectedMember.id]: true }));
    setLoadingOverlayOpen(true);
    
    try {
      const response = await fetch('/api/admin/connect-database/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          memberId: selectedMember.id,
          memberType: selectedMember.member_type,
          taxId: selectedMember.tax_id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to connect member');
      }

      // Compute info before clearing selection
      const resolvedCompanyName = result?.memberData?.COMPANY_NAME 
        || selectedMember?.company_name_th 
        || selectedMember?.company_name_en 
        || '';

      // Close modal first
      setShowModal(false);
      setSelectedMember(null);

      // Show success modal with details
      setSuccessInfo({
        open: true,
        memberCode: result.memberCode,
        companyName: resolvedCompanyName
      });
      
      // Refresh the list
      fetchApprovedMembers();
      if (activeTab === 'connected') {
        fetchConnectedMembers({ page: 1 });
      }
      
    } catch (err) {
      toast.error(
        <div>
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="text-sm">{err.message}</div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setConnecting(prev => ({ ...prev, [selectedMember.id]: false }));
      setLoadingOverlayOpen(false);
    }
  };

  const handleCloseModal = () => {
    if (!connecting[selectedMember?.id]) {
      setShowModal(false);
      setSelectedMember(null);
    }
  };

  if (loading && activeTab === 'pending') {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ToastContainer />
      <LoadingOverlay isOpen={loadingOverlayOpen} />
      <SuccessModal
        isOpen={successInfo.open}
        memberCode={successInfo.memberCode}
        companyName={successInfo.companyName}
        onClose={() => setSuccessInfo({ open: false, memberCode: '', companyName: '' })}
      />
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmConnect}
        member={selectedMember}
        isLoading={connecting[selectedMember?.id]}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">เชื่อมต่อฐานข้อมูล</h1>
            {/* Status Cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-md border cursor-pointer transition-colors ${activeTab === 'pending' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setActiveTab('pending')}
              >
                <div className="text-sm text-gray-500">รอเชื่อมต่อ</div>
                <div className="text-2xl font-bold text-gray-900">{members.length}</div>
              </div>
              <div
                className={`p-4 rounded-md border cursor-pointer transition-colors ${activeTab === 'connected' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => {
                  setActiveTab('connected');
                  if (connected.length === 0 && !connectedLoading) fetchConnectedMembers({ page: 1 });
                }}
              >
                <div className="text-sm text-gray-500">เชื่อมต่อแล้ว</div>
                <div className="text-2xl font-bold text-gray-900">{connectedCount}</div>
              </div>
            </div>

            {/* Tab Switch */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                รอเชื่อมต่อ
              </button>
              <button
                onClick={() => {
                  setActiveTab('connected');
                  if (connected.length === 0 && !connectedLoading) fetchConnectedMembers({ page: 1 });
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'connected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                เชื่อมต่อแล้ว
              </button>
            </div>
          </div>

          {activeTab === 'pending' && (
          <div className="p-6">
            {/* Pending search */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                placeholder="ค้นหา: ชื่อบริษัท / เลขภาษี / ผู้ใช้งาน / อีเมล"
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { /* client-side filter only */ }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >ค้นหา</button>
            </div>
            {members.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">
                  ไม่มีรายการสมาชิกที่ต้องเชื่อมต่อ
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  สมาชิกทั้งหมดได้รับการเชื่อมต่อแล้ว
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อบริษัท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เลขประจำตัวผู้เสียภาษี
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ใช้งาน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อัปเดตล่าสุด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(members.filter(m => {
                      const q = pendingSearch.trim().toLowerCase();
                      if (!q) return true;
                      const values = [
                        m.company_name_th,
                        m.company_name_en,
                        m.tax_id,
                        m.firstname,
                        m.lastname,
                        m.username,
                        m.user_email,
                      ].map(v => (v || '').toString().toLowerCase());
                      return values.some(v => v.includes(q));
                    })).map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.member_type === 'OC' ? 'bg-blue-100 text-blue-800' :
                            member.member_type === 'AC' ? 'bg-green-100 text-green-800' :
                            member.member_type === 'AM' ? 'bg-purple-100 text-purple-800' :
                            member.member_type === 'IC' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.member_type === 'OC' ? 'สน (โรงงาน)' :
                             member.member_type === 'AC' ? 'ทน (นิติบุคคล)' :
                             member.member_type === 'AM' ? 'สส (สมาคมการค้า)' :
                             member.member_type === 'IC' ? 'ทบ (บุคคลธรรมดา)' :
                             member.member_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.company_name_th}
                          </div>
                          {member.company_name_en && (
                            <div className="text-sm text-gray-500">
                              {member.company_name_en}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.tax_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>{(member.firstname || member.lastname) ? `${member.firstname || ''} ${member.lastname || ''}`.trim() : (member.username || '-')}</div>
                          {member.user_email && <div className="text-gray-500 text-xs">{member.user_email}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatThaiDate(member.updated_at || member.approved_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleConnect(member)}
                            disabled={connecting[member.id]}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                              connecting[member.id]
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {connecting[member.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังเชื่อมต่อ...
                              </>
                            ) : (
                              <>
                                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                เชื่อมต่อหมายเลขสมาชิก
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {activeTab === 'connected' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchConnectedMembers({ page: 1, q: e.currentTarget.value }); }}
                placeholder="ค้นหา: หมายเลขสมาชิก / ชื่อบริษัท / ชื่อผู้ใช้งาน / Email"
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => fetchConnectedMembers({ page: 1 })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >ค้นหา</button>
            </div>

            {connectedError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{connectedError}</div>
            )}

            {connectedLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเลขสมาชิก</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อบริษัท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขประจำตัวผู้เสียภาษี</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เชื่อมต่อเมื่อ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {connected.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                      </tr>
                    ) : connected.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.member_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.company_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            row.member_type === 'OC' ? 'bg-blue-100 text-blue-800' :
                            row.member_type === 'AC' ? 'bg-green-100 text-green-800' :
                            row.member_type === 'AM' ? 'bg-purple-100 text-purple-800' :
                            row.member_type === 'IC' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {row.member_type === 'OC' ? 'สน (โรงงาน)' :
                             row.member_type === 'AC' ? 'ทน (นิติบุคคล)' :
                             row.member_type === 'AM' ? 'สส (สมาคมการค้า)' :
                             row.member_type === 'IC' ? 'ทบ (บุคคลธรรมดา)' :
                             row.member_type || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.tax_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>{(row.firstname || row.lastname) ? `${row.firstname || ''} ${row.lastname || ''}`.trim() : (row.username || '-')}</div>
                          {row.user_email && <div className="text-gray-500 text-xs">{row.user_email}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.connected_at ? new Date(row.connected_at).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">หน้า {pagination.page} / {pagination.totalPages} • ทั้งหมด {pagination.total} รายการ</div>
                <div className="space-x-2">
                  <button
                    disabled={pagination.page <= 1 || connectedLoading}
                    onClick={() => fetchConnectedMembers({ page: Math.max(1, pagination.page - 1) })}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >ย้อนกลับ</button>
                  <button
                    disabled={pagination.page >= pagination.totalPages || connectedLoading}
                    onClick={() => fetchConnectedMembers({ page: Math.min(pagination.totalPages, pagination.page + 1) })}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >ถัดไป</button>
                </div>
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}