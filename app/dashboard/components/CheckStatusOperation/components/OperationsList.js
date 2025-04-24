import React, { useState } from 'react';
import { 
  getStatusIcon, 
  getStatusText, 
  getStatusClass 
} from './utils';
import { getContactMessageStatusIcon, getContactMessageStatusText, getContactMessageStatusClass } from './contactMessageStatusUtils';
import EmptyState from './EmptyState';
import StatusCard from './StatusCard';
import Pagination from './Pagination';

import { useEffect } from 'react';
import OperationsListSearchBar from './OperationsListSearchBar';

const OperationsList = ({ operations: initialOperations, userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [operations, setOperations] = useState(initialOperations);
  const [contactMessageStatus, setContactMessageStatus] = useState(null);
  const [verifications, setVerifications] = useState([]);
  // Search/filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState(['','']);

  // Filter options
  const operationTypeOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'ยืนยันสมาชิกเดิม', label: 'ยืนยันสมาชิกเดิม' },
    { value: 'ติดต่อเจ้าหน้าที่', label: 'ติดต่อเจ้าหน้าที่' },
    { value: 'แก้ไขข้อมูลส่วนตัว', label: 'แก้ไขข้อมูลส่วนตัว' },
  ];
  const statusOptions = [
    { value: 'pending', label: 'รอการอนุมัติ' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'rejected', label: 'ปฏิเสธแล้ว' },
    { value: 'unread', label: 'ยังไม่ได้อ่าน' },
    { value: 'read', label: 'อ่านแล้ว' },
    { value: 'replied', label: 'ตอบกลับแล้ว' },
    { value: 'none', label: 'ไม่มีข้อความ' },
    { value: 'error', label: 'โหลดผิดพลาด' },
  ];

  // Fetch contact message status
  useEffect(() => {
    if (!userId) return;
    console.log('Fetching contact message status for user:', userId);
    fetch(`/api/dashboard/operation-status/contact-message-status?userId=${userId}`)
      .then(res => {
        // Check if response is OK and is JSON
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Contact message API response:', data);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          const latest = data.messages[0];
          console.log('Latest contact message:', latest);
          setContactMessageStatus({
            id: latest.id || Date.now(),
            title: 'ติดต่อเจ้าหน้าที่',
            description: `หัวข้อ: ${latest.subject || 'ไม่มีหัวข้อ'} - สถานะการติดต่อเจ้าหน้าที่`,
            status: latest.status || 'unread',
            created_at: latest.created_at || new Date().toISOString(),
            subject: latest.subject || ''
          });
        } else {
          // แม้ไม่มีข้อความก็ให้แสดงสถานะว่าไม่มีข้อความ
          console.log('No contact messages found, creating placeholder');
          setContactMessageStatus({
            id: Date.now(),
            title: 'ติดต่อเจ้าหน้าที่',
            description: 'คุณยังไม่มีการติดต่อเจ้าหน้าที่',
            status: 'none',
            created_at: new Date().toISOString()
          });
        }
      })
      .catch(error => {
        console.error('Error fetching contact message status:', error);
        // แม้มี error ก็ให้แสดงสถานะว่าไม่มีข้อความ
        setContactMessageStatus({
          id: Date.now(),
          title: 'ติดต่อเจ้าหน้าที่',
          description: 'ไม่สามารถดึงข้อมูลสถานะการติดต่อได้',
          status: 'error',
          created_at: new Date().toISOString()
        });
      });
  }, [userId]);

  // Fetch verifications (member verification status)
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/member/verification-status?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        let merged = [];
        if (data.verifications && Array.isArray(data.verifications)) {
          merged = data.verifications.filter(v => v.Admin_Submit !== 3);
        } else if (data.submitted && data.memberData && data.memberData.Admin_Submit !== 3) {
          merged = [{
            id: data.memberData.id || Date.now(),
            MEMBER_CODE: data.memberData.MEMBER_CODE || '',
            company_name: data.memberData.company_name || '',
            company_type: data.memberData.company_type || '',
            tax_id: data.memberData.tax_id || '',
            Admin_Submit: data.approved ? 1 : data.rejected ? 2 : 0,
            reject_reason: data.rejectReason || '',
            created_at: data.memberData.created_at || new Date().toISOString()
          }];
        }
        setVerifications(merged);
      });
  }, [userId]);

  // Merge all cards for display
  useEffect(() => {
    let mergedOps = [...initialOperations];
    // Add verifications as operation cards
    if (verifications.length > 0) {
      const verificationOps = verifications.map(v => ({
        id: v.id,
        title: `ยืนยันสมาชิกเดิม: ${v.company_name} (${v.MEMBER_CODE})`,
        description: `ประเภทบริษัท: ${v.company_type}`,
        status: v.Admin_Submit === 1 ? 'approved' : v.Admin_Submit === 2 ? 'rejected' : 'pending',
        created_at: v.created_at,
        reason: v.reject_reason,
        company_name: v.company_name,
        MEMBER_CODE: v.MEMBER_CODE
      }));
      mergedOps = [...verificationOps, ...mergedOps];
    }
    // Add contact message status as operation card
    if (contactMessageStatus) {
      mergedOps = [contactMessageStatus, ...mergedOps];
    }
    setOperations(mergedOps);
  }, [initialOperations, contactMessageStatus, verifications]);

  // Filtering
  const filteredOperations = operations.filter(op => {
    // Search by subject, company_name, MEMBER_CODE, description
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (!searchLower ||
        (op.subject && op.subject.toLowerCase().includes(searchLower)) ||
        (op.company_name && op.company_name.toLowerCase().includes(searchLower)) ||
        (op.MEMBER_CODE && op.MEMBER_CODE.toLowerCase().includes(searchLower)) ||
        (op.description && op.description.toLowerCase().includes(searchLower))
      );
    // Filter by status
    const matchesStatus = !statusFilter || op.status === statusFilter;
    // Filter by type
    let typeLabel = '';
    if (op.title?.includes('ยืนยันสมาชิกเดิม')) typeLabel = 'ยืนยันสมาชิกเดิม';
    else if (op.title === 'ติดต่อเจ้าหน้าที่') typeLabel = 'ติดต่อเจ้าหน้าที่';
    else typeLabel = 'แก้ไขข้อมูลส่วนตัว';
    const matchesType = !typeFilter || typeLabel === typeFilter;
    // Filter by date
    let matchesDate = true;
    if (dateRange[0]) {
      matchesDate = matchesDate && new Date(op.created_at) >= new Date(dateRange[0]);
    }
    if (dateRange[1]) {
      matchesDate = matchesDate && new Date(op.created_at) <= new Date(dateRange[1] + 'T23:59:59');
    }
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Calculate pagination
  const indexOfLastOperation = currentPage * itemsPerPage;
  const indexOfFirstOperation = indexOfLastOperation - itemsPerPage;
  const currentOperations = filteredOperations.slice(indexOfFirstOperation, indexOfLastOperation);
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" id="operations-container">
      <h3 className="text-xl font-semibold mb-4 text-blue-800">สถานะการดำเนินการทั้งหมด</h3>
      <OperationsListSearchBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        operationTypeOptions={operationTypeOptions}
        statusOptions={statusOptions}
      />
      {filteredOperations.length === 0 ? (
        <EmptyState message="ไม่พบรายการแก้ไขข้อมูล" />
      ) : (
        <div className="space-y-4">
          {currentOperations.map((operation, index) => (
            <StatusCard
              key={index}
              icon={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusIcon(operation.status) : getStatusIcon(operation.status)}
              title={operation.title}
              description={operation.description}
              statusText={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusText(operation.status) : getStatusText(operation.status)}
              statusClass={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusClass(operation.status) : getStatusClass(operation.status)}
              date={operation.created_at}
              errorMessage={operation.status === 'rejected' ? operation.reason : null}
            />
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default OperationsList;