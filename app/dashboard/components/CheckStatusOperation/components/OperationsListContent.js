import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getStatusIcon, 
  getStatusText, 
  getStatusClass 
} from './utils';
import { getContactMessageStatusIcon, getContactMessageStatusText, getContactMessageStatusClass } from './contactMessageStatusUtils';
import { getAddressUpdateStatusIcon, getAddressUpdateStatusText, getAddressUpdateStatusClass } from './addressUpdateStatusUtils';
import EmptyState from './EmptyState';
import StatusCard from './StatusCard';
import Pagination from './Pagination';
import { containerVariants, itemVariants } from '../utils/animationVariants';

const OperationsListContent = ({ 
  isLoading, 
  filteredOperations, 
  currentOperations, 
  totalPages, 
  currentPage, 
  setCurrentPage 
}) => {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 flex justify-center items-center"
      >
        <div className="loader rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin" style={{ borderTopColor: '#3B82F6' }}></div>
      </motion.div>
    );
  }

  if (filteredOperations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState message="ไม่พบรายการแก้ไขข้อมูล" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      className="space-y-4"
    >
      <AnimatePresence mode="wait">
        {currentOperations.map((operation, index) => (
          <motion.div
            key={`${operation.type}-${operation.id}-${index}`}
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
              icon={
                operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusIcon(operation.status) : 
                operation.title === 'แก้ไขข้อมูลสมาชิก' ? getAddressUpdateStatusIcon(operation.status) :
                getStatusIcon(operation.status)
              }
              title={operation.title}
              description={operation.description}
              statusText={
                operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusText(operation.status) :
                operation.title === 'แก้ไขข้อมูลสมาชิก' ? getAddressUpdateStatusText(operation.status) :
                getStatusText(operation.status)
              }
              statusClass={
                operation.title === 'ติดต่อเจ้าหน้าที่' ? getContactMessageStatusClass(operation.status) :
                operation.title === 'แก้ไขข้อมูลสมาชิก' ? getAddressUpdateStatusClass(operation.status) :
                getStatusClass(operation.status)
              }
              date={operation.created_at}
              errorMessage={operation.status === 'rejected' ? operation.reason : null}
              id={operation.id}
              type={operation.type || (
                operation.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' : 
                operation.title === 'แก้ไขข้อมูลสมาชิก' ? 'แก้ไขข้อมูลสมาชิก' :
                operation.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 'แก้ไขข้อมูลส่วนตัว'
              )}
              status={operation.status}
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
  );
};

export default OperationsListContent;
