import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusCard from './StatusCard';
import EmptyState from './EmptyState';
import { getStatusIcon, getStatusText, getStatusClass } from './utils';
import { getContactMessageStatusIcon, getContactMessageStatusText, getContactMessageStatusClass } from './contactMessageStatusUtils';
import { getAddressUpdateStatusIcon, getAddressUpdateStatusText, getAddressUpdateStatusClass } from './addressUpdateStatusUtils';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const GeneralOperationsList = ({ operations }) => {
  // กรองเฉพาะรายการที่ไม่ใช่การอัปเดตโลโก้, รหัส TSIC, หรือโซเชียลมีเดีย
  const filteredOperations = operations.filter(op => 
    op.type !== 'อัปเดตโลโก้บริษัท' && 
    op.type !== 'อัปเดตรหัส TSIC' && 
    op.type !== 'อัปเดตโซเชียลมีเดีย'
  );
  
  if (!filteredOperations || filteredOperations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-semibold text-blue-700 border-b border-gray-200 pb-2">
          การดำเนินการอื่นๆ
        </h4>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {filteredOperations.map((operation, index) => (
          <motion.div
            key={`general-${operation.id}-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="mb-4"
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
              date={new Date(operation.created_at).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              details={operation}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GeneralOperationsList;
