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

  useEffect(() => {
    fetchApprovedMembers();
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

  const handleConfirmConnect = async () => {
    if (!selectedMember) return;
    
    setConnecting(prev => ({ ...prev, [selectedMember.id]: true }));
    
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

      // Close modal first
      setShowModal(false);
      setSelectedMember(null);
      
      // Show success toast
      toast.success(
        <div>
          <div className="font-medium">เชื่อมต่อสำเร็จ!</div>
          <div className="text-sm">หมายเลขสมาชิก: {result.memberCode}</div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      // Refresh the list
      fetchApprovedMembers();
      
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
    }
  };

  const handleCloseModal = () => {
    if (!connecting[selectedMember?.id]) {
      setShowModal(false);
      setSelectedMember(null);
    }
  };

  if (loading) {
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
            <p className="text-gray-600 mt-2">
              รายการสมาชิกที่ได้รับการอนุมัติแล้วแต่ยังไม่มีหมายเลขสมาชิก
            </p>
          </div>

          <div className="p-6">
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
                        วันที่อนุมัติ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.member_type === 'OC' ? 'bg-blue-100 text-blue-800' :
                            member.member_type === 'AC' ? 'bg-green-100 text-green-800' :
                            member.member_type === 'AM' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.member_type === 'OC' ? 'สน (โรงงาน)' :
                             member.member_type === 'AC' ? 'ทน (นิติบุคคล)' :
                             member.member_type === 'AM' ? 'สส (สมาคมการค้า)' :
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.approved_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
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
        </div>
      </div>
    </AdminLayout>
  );
}