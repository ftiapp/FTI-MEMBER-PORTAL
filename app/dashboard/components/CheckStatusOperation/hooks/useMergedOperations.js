import { useState, useEffect } from 'react';

/**
 * Custom hook to merge all operations data
 * @param {Array} initialOperations - The initial operations
 * @param {Array} contactMessageStatus - The contact message status data
 * @param {Array} verifications - The verification status data
 * @param {Array} addressUpdates - The address update status data
 * @param {Array} productUpdates - The product update status data
 * @param {Array} socialMediaUpdates - The social media update status data
 * @param {Array} logoUpdates - The logo update status data
 * @param {Array} tsicUpdates - The TSIC code update status data
 * @returns {Array} - The merged operations
 */
const useMergedOperations = (initialOperations, contactMessageStatus, verifications, addressUpdates, productUpdates, socialMediaUpdates, logoUpdates, tsicUpdates) => {
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
        
      // Add all contact messages to the operations list without special priority
      mergedOps = [...mergedOps, ...newContactMessages];
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
    
    // Add product update requests as operation cards
    if (productUpdates && productUpdates.length > 0) {
      // Filter out any product updates that might already exist in initialOperations
      const existingProductUpdateIds = new Set(
        initialOperations
          .filter(op => op.title === 'แก้ไขข้อมูลสินค้า')
          .map(op => op.id)
      );
      
      const productUpdateOps = productUpdates
        .filter(update => update.status !== 'none' && update.status !== 'error' && !existingProductUpdateIds.has(update.id))
        .map(update => ({
          id: update.id,
          title: 'แก้ไขข้อมูลสินค้า',
          description: `คำขอแก้ไขข้อมูลสินค้า: ${update.company_name || update.member_code} (${update.member_type})`,
          status: update.status,
          created_at: update.created_at,
          reason: update.reject_reason,
          member_code: update.member_code,
          member_type: update.member_type,
          member_group_code: update.member_group_code,
          type_code: update.type_code,
          company_name: update.company_name,
          type: 'แก้ไขข้อมูลสินค้า'
        }));
      
      // Add placeholder if no actual product updates
      if (productUpdateOps.length === 0 && productUpdates.some(update => update.status === 'none' || update.status === 'error')) {
        const placeholder = productUpdates.find(update => update.status === 'none' || update.status === 'error');
        if (placeholder) {
          productUpdateOps.push({
            id: placeholder.id,
            title: 'แก้ไขข้อมูลสินค้า',
            description: placeholder.description || 'สถานะการแก้ไขข้อมูลสินค้า',
            status: placeholder.status,
            created_at: placeholder.created_at,
            type: 'แก้ไขข้อมูลสินค้า'
          });
        }
      }
      
      // Add all product updates to the operations list
      mergedOps = [...productUpdateOps, ...mergedOps];
    }
    
    // Add social media updates as operation cards
    if (socialMediaUpdates && socialMediaUpdates.length > 0) {
      // Filter out any social media updates that might already exist in initialOperations
      const existingSocialMediaIds = new Set(
        initialOperations
          .filter(op => op.title === 'อัปเดตโซเชียลมีเดีย')
          .map(op => op.id)
      );
      
      const socialMediaOps = socialMediaUpdates
        .filter(update => update.status !== 'none' && update.status !== 'error' && !existingSocialMediaIds.has(update.id))
        .map(update => ({
          id: update.id,
          title: 'อัปเดตโซเชียลมีเดีย',
          description: update.description || `บริษัท: ${update.company_name || update.member_code} (${update.items?.length || 0} รายการ)`,
          status: 'approved', // Social media updates are always approved
          created_at: update.created_at,
          member_code: update.member_code,
          company_name: update.company_name,
          items: update.items,
          type: 'อัปเดตโซเชียลมีเดีย'
        }));
      
      // Add placeholder if no actual social media updates
      if (socialMediaOps.length === 0 && socialMediaUpdates.some(update => update.status === 'none' || update.status === 'error')) {
        const placeholder = socialMediaUpdates.find(update => update.status === 'none' || update.status === 'error');
        if (placeholder) {
          socialMediaOps.push({
            id: placeholder.id,
            title: 'อัปเดตโซเชียลมีเดีย',
            description: placeholder.description || 'คุณยังไม่มีการอัปเดตโซเชียลมีเดีย',
            status: placeholder.status,
            created_at: placeholder.created_at,
            type: 'อัปเดตโซเชียลมีเดีย'
          });
        }
      }
      
      // Add all social media updates to the operations list
      mergedOps = [...socialMediaOps, ...mergedOps];
    }
    
    // Add logo updates as operation cards
    if (logoUpdates && logoUpdates.length > 0) {
      // Filter out any logo updates that might already exist in initialOperations
      const existingLogoIds = new Set(
        initialOperations
          .filter(op => op.title === 'อัปเดตโลโก้บริษัท')
          .map(op => op.id)
      );
      
      const logoOps = logoUpdates
        .filter(update => update.status !== 'none' && update.status !== 'error' && !existingLogoIds.has(update.id))
        .map(update => ({
          id: update.id,
          title: 'อัปเดตโลโก้บริษัท',
          description: update.description || `บริษัท: ${update.company_name || update.member_code}`,
          status: 'approved', // Logo updates are always approved
          created_at: update.created_at,
          member_code: update.member_code,
          company_name: update.company_name,
          logo_url: update.logo_url,
          display_mode: update.display_mode,
          type: 'อัปเดตโลโก้บริษัท'
        }));
      
      // Add placeholder if no actual logo updates
      if (logoOps.length === 0 && logoUpdates.some(update => update.status === 'none' || update.status === 'error')) {
        const placeholder = logoUpdates.find(update => update.status === 'none' || update.status === 'error');
        if (placeholder) {
          logoOps.push({
            id: placeholder.id,
            title: 'อัปเดตโลโก้บริษัท',
            description: placeholder.description || 'คุณยังไม่มีการอัปเดตโลโก้บริษัท',
            status: placeholder.status,
            created_at: placeholder.created_at,
            type: 'อัปเดตโลโก้บริษัท'
          });
        }
      }
      
      // Add all logo updates to the operations list
      mergedOps = [...logoOps, ...mergedOps];
    }
    
    // Add TSIC updates as operation cards
    if (tsicUpdates && tsicUpdates.length > 0) {
      // Filter out any TSIC updates that might already exist in initialOperations
      const existingTsicIds = new Set(
        initialOperations
          .filter(op => op.title === 'อัปเดตรหัส TSIC')
          .map(op => op.id)
      );
      
      // Filter valid updates
      const validTsicUpdates = tsicUpdates.filter(update => 
        update.status !== 'none' && 
        update.status !== 'error' && 
        !existingTsicIds.has(update.id)
      );
      
      // Group TSIC updates by member_code
      const groupedTsicUpdates = {};
      validTsicUpdates.forEach(update => {
        if (!groupedTsicUpdates[update.member_code]) {
          groupedTsicUpdates[update.member_code] = [];
        }
        groupedTsicUpdates[update.member_code].push(update);
      });
      
      // Create one operation card per member_code with the latest status
      const tsicOps = [];
      
      Object.keys(groupedTsicUpdates).forEach(member_code => {
        const updates = groupedTsicUpdates[member_code];
        // Sort by created_at (newest first)
        updates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latestUpdate = updates[0];
        
        tsicOps.push({
          id: latestUpdate.id,
          title: 'อัปเดตรหัส TSIC',
          description: latestUpdate.company_name || `รหัสสมาชิก: ${latestUpdate.member_code}`,
          status: latestUpdate.status,
          created_at: latestUpdate.created_at,
          member_code: latestUpdate.member_code,
          company_name: latestUpdate.company_name,
          tsic_code: latestUpdate.tsic_code,
          category_code: latestUpdate.category_code,
          type: 'อัปเดตรหัส TSIC'
        });
      });
      
      // Add placeholder if no actual TSIC updates
      if (tsicOps.length === 0 && tsicUpdates.some(update => update.status === 'none' || update.status === 'error')) {
        const placeholder = tsicUpdates.find(update => update.status === 'none' || update.status === 'error');
        if (placeholder) {
          tsicOps.push({
            id: placeholder.id,
            title: 'อัปเดตรหัส TSIC',
            description: placeholder.description || 'คุณยังไม่มีการอัปเดตรหัส TSIC',
            status: placeholder.status,
            created_at: placeholder.created_at,
            type: 'อัปเดตรหัส TSIC'
          });
        }
      }
      
      // Add all TSIC updates to the operations list
      mergedOps = [...tsicOps, ...mergedOps];
    }
    
    // Add the rest of initialOperations with type property
    const restOps = initialOperations.map(op => ({
      ...op,
      type: op.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 
            op.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' :
            op.title === 'แก้ไขข้อมูลสมาชิก' ? 'แก้ไขข้อมูลสมาชิก' :
            op.title === 'แก้ไขข้อมูลสินค้า' ? 'แก้ไขข้อมูลสินค้า' :
            op.title === 'อัปเดตโซเชียลมีเดีย' ? 'อัปเดตโซเชียลมีเดีย' :
            op.title === 'อัปเดตโลโก้บริษัท' ? 'อัปเดตโลโก้บริษัท' :
            op.title === 'อัปเดตรหัส TSIC' ? 'อัปเดตรหัส TSIC' : 'แก้ไขข้อมูลส่วนตัว'
    }));
    
    mergedOps = [...mergedOps, ...restOps];
    
    // Sort by created_at (newest first)
    mergedOps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setOperations(mergedOps);
  }, [initialOperations, contactMessageStatus, verifications, addressUpdates, productUpdates, socialMediaUpdates, logoUpdates, tsicUpdates]);

  return operations;
};

export default useMergedOperations;
