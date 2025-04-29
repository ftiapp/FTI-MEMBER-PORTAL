import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getStatusIcon, 
  getStatusText, 
  getStatusClass 
} from './utils';
import { getContactMessageStatusIcon, getContactMessageStatusText, getContactMessageStatusClass } from './contactMessageStatusUtils';
import EmptyState from './EmptyState';
import StatusCard from './StatusCard';
import Pagination from './Pagination';
import OperationsListSearchBar from './OperationsListSearchBar';

const OperationsList = ({ operations: initialOperations, userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [operations, setOperations] = useState(initialOperations);
  const [contactMessageStatus, setContactMessageStatus] = useState([]);
  const [verifications, setVerifications] = useState([]);
  // Search/filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState(['','']);
  const [isLoading, setIsLoading] = useState(true);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.1,
        duration: 0.5
      }
    }
  };

  // Fetch contact message status
  useEffect(() => {
    if (!userId) return;
    
    setIsLoading(true);
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
          // Map all messages to operation cards instead of just the latest one
          const contactMessages = data.messages.map(message => ({
            id: message.id || Date.now(),
            title: 'ติดต่อเจ้าหน้าที่',
            description: `หัวข้อ: ${message.subject || 'ไม่มีหัวข้อ'} - สถานะการติดต่อเจ้าหน้าที่`,
            status: message.status || 'unread',
            created_at: message.created_at || new Date().toISOString(),
            subject: message.subject || '',
            type: 'ติดต่อเจ้าหน้าที่',
            message_content: message.message || ''
          }));
          setContactMessageStatus(contactMessages);
        } else {
          // แม้ไม่มีข้อความก็ให้แสดงสถานะว่าไม่มีข้อความ
          console.log('No contact messages found, creating placeholder');
          setContactMessageStatus([{
            id: Date.now(),
            title: 'ติดต่อเจ้าหน้าที่',
            description: 'คุณยังไม่มีการติดต่อเจ้าหน้าที่',
            status: 'none',
            created_at: new Date().toISOString(),
            type: 'ติดต่อเจ้าหน้าที่'
          }]);
        }
      })
      .catch(error => {
        console.error('Error fetching contact message status:', error);
        // แม้มี error ก็ให้แสดงสถานะว่าไม่มีข้อความ
        setContactMessageStatus([{
          id: Date.now(),
          title: 'ติดต่อเจ้าหน้าที่',
          description: 'ไม่สามารถดึงข้อมูลสถานะการติดต่อได้',
          status: 'error',
          created_at: new Date().toISOString(),
          type: 'ติดต่อเจ้าหน้าที่'
        }]);
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  // Merge all cards for display
  useEffect(() => {
    // Start with a clean array to avoid duplicates
    let mergedOps = [];
    
    // Add verifications as operation cards (only if they don't exist in initialOperations)
    if (verifications.length > 0) {
      const verificationIds = new Set(initialOperations
        .filter(op => op.title?.includes('ยืนยันสมาชิกเดิม'))
        .map(op => op.id));
      
      const verificationOps = verifications
        .filter(v => !verificationIds.has(v.id)) // Only add if not already in initialOperations
        .map(v => ({
          id: v.id,
          title: `ยืนยันสมาชิกเดิม: ${v.company_name} (${v.MEMBER_CODE})`,
          description: `ประเภทบริษัท: ${v.company_type}`,
          status: v.Admin_Submit === 1 ? 'approved' : v.Admin_Submit === 2 ? 'rejected' : 'pending',
          created_at: v.created_at,
          reason: v.reject_reason,
          company_name: v.company_name,
          MEMBER_CODE: v.MEMBER_CODE,
          type: 'ยืนยันสมาชิกเดิม' // Add explicit type for filtering
        }));
      
      mergedOps = [...verificationOps];
    }
    
    // Add all contact messages as operation cards
    if (contactMessageStatus && contactMessageStatus.length > 0) {
      // Filter out any contact messages that might already exist in initialOperations
      const existingContactIds = new Set(
        initialOperations
          .filter(op => op.title === 'ติดต่อเจ้าหน้าที่')
          .map(op => op.id)
      );
      
      const newContactMessages = contactMessageStatus
        .filter(msg => !existingContactIds.has(msg.id))
        
      // Add all contact messages to the operations list
      mergedOps = [...newContactMessages, ...mergedOps];
    }
    
    // Add the rest of initialOperations with type property
    const restOps = initialOperations.map(op => ({
      ...op,
      type: op.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 
            op.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' : 'แก้ไขข้อมูลส่วนตัว'
    }));
    
    mergedOps = [...mergedOps, ...restOps];
    
    // Sort by created_at (newest first)
    mergedOps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setOperations(mergedOps);
  }, [initialOperations, contactMessageStatus, verifications]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, dateRange]);

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
      
    // Get operation type
    const opType = op.type || 
      (op.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 
       op.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' : 'แก้ไขข้อมูลส่วนตัว');
      
    // Filter by type
    const matchesType = !typeFilter || opType === typeFilter;
    
    // Filter by status - only apply status filters that are relevant to the current type
    let matchesStatus = true;
    if (statusFilter) {
      // For contact messages, only allow unread, read, replied statuses
      if (opType === 'ติดต่อเจ้าหน้าที่') {
        if (!['unread', 'read', 'replied', 'none', 'error'].includes(statusFilter)) {
          matchesStatus = false;
        } else {
          matchesStatus = op.status === statusFilter;
        }
      } 
      // For verifications, only allow pending, approved, rejected statuses
      else if (opType === 'ยืนยันสมาชิกเดิม') {
        if (!['pending', 'approved', 'rejected'].includes(statusFilter)) {
          matchesStatus = false;
        } else {
          matchesStatus = op.status === statusFilter;
        }
      }
      // For other types, apply the filter normally
      else {
        matchesStatus = op.status === statusFilter;
      }
    }
    
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      id="operations-container"
    >
      <motion.h3 
        variants={headingVariants} 
        className="text-xl font-semibold mb-1 text-blue-800"
      >
        สถานะการดำเนินการทั้งหมด
      </motion.h3>
      
      <motion.p 
        variants={headingVariants}
        className="text-gray-500 text-sm mb-4"
      >
        ตรวจสอบสถานะคำขอ คำร้อง หรือการดำเนินการต่าง ๆ ที่เกี่ยวข้องกับบัญชีและข้อมูลสมาชิกของคุณได้ที่นี่
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
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
      </motion.div>
      
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 flex justify-center items-center"
        >
          <div className="loader rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin" style={{ borderTopColor: '#3B82F6' }}></div>
        </motion.div>
      ) : filteredOperations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState message="ไม่พบรายการแก้ไขข้อมูล" />
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {currentOperations.map((operation, index) => (
              <motion.div
                key={operation.id || index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
              >
                <StatusCard
                  icon={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusIcon(operation.status) : getStatusIcon(operation.status)}
                  title={operation.title}
                  description={operation.description}
                  statusText={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusText(operation.status) : getStatusText(operation.status)}
                  statusClass={operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusClass(operation.status) : getStatusClass(operation.status)}
                  date={operation.created_at}
                  errorMessage={operation.status === 'rejected' ? operation.reason : null}
                  id={operation.id}
                  type={operation.type || (operation.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' : operation.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 'แก้ไขข้อมูลส่วนตัว')}
                  message_content={operation.message_content}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OperationsList;