import { useState, useEffect } from 'react';

/**
 * Custom hook to merge all operations data
 * @param {Array} initialOperations - The initial operations
 * @param {Array} contactMessageStatus - The contact message status data
 * @param {Array} verifications - The verification status data
 * @param {Array} addressUpdates - The address update status data
 * @returns {Array} - The merged operations
 */
const useMergedOperations = (initialOperations, contactMessageStatus, verifications, addressUpdates) => {
  const [operations, setOperations] = useState([]);

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
        .filter(msg => !existingContactIds.has(msg.id));
        
      // Add all contact messages to the operations list
      mergedOps = [...newContactMessages, ...mergedOps];
    }
    
    // Add address update requests as operation cards
    if (addressUpdates && addressUpdates.length > 0) {
      // Filter out any address updates that might already exist in initialOperations
      const existingAddressUpdateIds = new Set(
        initialOperations
          .filter(op => op.title === 'แก้ไขข้อมูลสมาชิก')
          .map(op => op.id)
      );
      
      const addressUpdateOps = addressUpdates
        .filter(update => update.status !== 'none' && update.status !== 'error' && !existingAddressUpdateIds.has(update.id))
        .map(update => ({
          id: update.id,
          title: 'แก้ไขข้อมูลสมาชิก',
          description: `คำขอแก้ไขที่อยู่: ${update.company_name || update.member_code} (${update.addr_code === '001' ? 'ที่อยู่สำหรับติดต่อ (ทะเบียน)' : update.addr_code === '002' ? 'ที่อยู่สำหรับจัดส่งเอกสาร' : update.addr_code === '003' ? 'ที่อยู่สำหรับออกใบกำกับภาษี' : update.addr_code})`,
          status: update.status,
          created_at: update.request_date,
          reason: update.admin_comment,
          member_code: update.member_code,
          old_address: update.old_address,
          new_address: update.new_address,
          type: 'แก้ไขข้อมูลสมาชิก'
        }));
      
      // Add placeholder if no actual address updates
      if (addressUpdateOps.length === 0 && addressUpdates.some(update => update.status === 'none' || update.status === 'error')) {
        const placeholder = addressUpdates.find(update => update.status === 'none' || update.status === 'error');
        if (placeholder) {
          addressUpdateOps.push({
            id: placeholder.id,
            title: 'แก้ไขข้อมูลสมาชิก',
            description: placeholder.description || 'สถานะการแก้ไขที่อยู่',
            status: placeholder.status,
            created_at: placeholder.created_at,
            type: 'แก้ไขข้อมูลสมาชิก'
          });
        }
      }
      
      // Add all address updates to the operations list
      mergedOps = [...addressUpdateOps, ...mergedOps];
    }
    
    // Add the rest of initialOperations with type property
    const restOps = initialOperations.map(op => ({
      ...op,
      type: op.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 
            op.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' :
            op.title === 'แก้ไขข้อมูลสมาชิก' ? 'แก้ไขข้อมูลสมาชิก' : 'แก้ไขข้อมูลส่วนตัว'
    }));
    
    mergedOps = [...mergedOps, ...restOps];
    
    // Sort by created_at (newest first)
    mergedOps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setOperations(mergedOps);
  }, [initialOperations, contactMessageStatus, verifications, addressUpdates]);

  return operations;
};

export default useMergedOperations;
