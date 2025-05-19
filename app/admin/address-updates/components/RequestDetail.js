'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function RequestDetail({ 
  selectedRequest, 
  adminNotes,
  setAdminNotes,
  isProcessing, 
  handleApprove, 
  onRejectClick 
}) {
  const [activeTab, setActiveTab] = useState('old');
  
  if (!selectedRequest) {
    return (
      <motion.div 
        className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500 font-medium">เลือกคำขอแก้ไขที่อยู่เพื่อดูรายละเอียด</p>
      </motion.div>
    );
  }
  
  // Parse address JSON
  let oldAddress = {};
  let newAddress = {};
  
  try {
    oldAddress = typeof selectedRequest.old_address === 'string' 
      ? JSON.parse(selectedRequest.old_address) 
      : selectedRequest.old_address || {};
  } catch (e) {
    console.error('Error parsing old address:', e);
  }
  
  try {
    newAddress = typeof selectedRequest.new_address === 'string' 
      ? JSON.parse(selectedRequest.new_address) 
      : selectedRequest.new_address || {};
  } catch (e) {
    console.error('Error parsing new address:', e);
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm น.', { locale: th });
  };
  
  // Get language label
  const getLanguageLabel = (addrLang) => {
    return addrLang === 'en' ? 'ภาษาอังกฤษ' : 'ภาษาไทย';
  };
  
  // Map member type code to readable text
  const getMemberTypeName = (typeCode) => {
    const memberTypeMap = {
      '000': 'สภาอุตสาหกรรม',
      '100': 'กลุ่มอุตสาหกรรม',
      '200': 'สภาอุตสาหกรรมจังหวัด'
    };
    return memberTypeMap[typeCode] || typeCode;
  };
  
  // Map member subtype code to readable text
  const getMemberSubtypeName = (typeCode) => {
    const memberSubtypeMap = {
      '11': 'สน (สามัญ-โรงงาน)',
      '12': 'สส (สามัญ-สมาคมการค้า)',
      '21': 'ทน (สมทบ-นิติบุคคล)',
      '22': 'ทบ (สมทบ-บุคคลธรรมดา)'
    };
    return memberSubtypeMap[typeCode] || typeCode;
  };
  
  // Map address code to readable text
  const getAddressTypeName = (addrCode) => {
    const addressTypeMap = {
      '001': 'ที่อยู่สำหรับติดต่อ (ทะเบียน)',
      '002': 'ที่อยู่สำหรับจัดส่งเอกสาร',
      '003': 'ที่อยู่สำหรับออกใบกำกับภาษี',
    };
    return addressTypeMap[addrCode] || `ที่อยู่รหัส ${addrCode}`;
  };
  
  // Format full address
  const formatFullAddress = (address) => {
    if (!address) return 'ไม่มีข้อมูล';
    
    const parts = [];
    
    if (address.ADDR_NO) parts.push(`เลขที่ ${address.ADDR_NO}`);
    if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
    if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
    if (address.ADDR_ROAD) parts.push(`ถนน ${address.ADDR_ROAD}`);
    if (address.ADDR_SUB_DISTRICT) parts.push(`แขวง/ตำบล ${address.ADDR_SUB_DISTRICT}`);
    if (address.ADDR_DISTRICT) parts.push(`เขต/อำเภอ ${address.ADDR_DISTRICT}`);
    if (address.ADDR_PROVINCE_NAME) parts.push(`จังหวัด ${address.ADDR_PROVINCE_NAME}`);
    if (address.ADDR_POSTCODE) parts.push(`รหัสไปรษณีย์ ${address.ADDR_POSTCODE}`);
    
    const contactInfo = [];
    if (address.ADDR_TELEPHONE) contactInfo.push(`โทรศัพท์: ${address.ADDR_TELEPHONE}`);
    if (address.ADDR_FAX) contactInfo.push(`แฟกซ์: ${address.ADDR_FAX}`);
    if (address.ADDR_EMAIL) contactInfo.push(`อีเมล: ${address.ADDR_EMAIL}`);
    if (address.ADDR_WEBSITE) contactInfo.push(`เว็บไซต์: ${address.ADDR_WEBSITE}`);
    
    return (
      <div>
        <p className="mb-2">{parts.join(' ')}</p>
        {contactInfo.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {contactInfo.map((info, index) => (
              <p key={index}>{info}</p>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Find changes between old and new addresses
  const findChanges = () => {
    const changes = [];
    
    const fieldLabels = {
      ADDR_NO: 'เลขที่',
      ADDR_MOO: 'หมู่',
      ADDR_SOI: 'ซอย',
      ADDR_ROAD: 'ถนน',
      ADDR_SUB_DISTRICT: 'แขวง/ตำบล',
      ADDR_DISTRICT: 'เขต/อำเภอ',
      ADDR_PROVINCE_NAME: 'จังหวัด',
      ADDR_POSTCODE: 'รหัสไปรษณีย์',
      ADDR_TELEPHONE: 'โทรศัพท์',
      ADDR_FAX: 'แฟกซ์',
      ADDR_EMAIL: 'อีเมล',
      ADDR_WEBSITE: 'เว็บไซต์'
    };
    
    Object.keys(fieldLabels).forEach(field => {
      if (oldAddress[field] !== newAddress[field]) {
        changes.push({
          field: fieldLabels[field],
          oldValue: oldAddress[field] || '-',
          newValue: newAddress[field] || '-'
        });
      }
    });
    
    return changes;
  };
  
  const changes = findChanges();
  
  return (
    <motion.div 
      className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">รายละเอียดคำขอแก้ไขที่อยู่</h2>
        <p className="text-sm opacity-90">
          {selectedRequest.status === 'pending' ? 'รอการอนุมัติ' : 
           selectedRequest.status === 'approved' ? 'อนุมัติแล้ว' : 
           selectedRequest.status === 'rejected' ? 'ปฏิเสธแล้ว' : selectedRequest.status}
        </p>
      </div>
      
      {/* Member Info */}
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg mb-2">ข้อมูลสมาชิก</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">รหัสสมาชิก</p>
            <p className="font-medium">{selectedRequest.member_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">รหัสบุคคล</p>
            <p className="font-medium">{selectedRequest.comp_person_code || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทสมาชิก</p>
            <p className="font-medium">{getMemberTypeName(selectedRequest.member_type)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">กลุ่มสมาชิก</p>
            <p className="font-medium">{selectedRequest.member_group_code || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทสมาชิกย่อย</p>
            <p className="font-medium">{getMemberSubtypeName(selectedRequest.type_code)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทที่อยู่</p>
            <p className="font-medium">{getAddressTypeName(selectedRequest.addr_code)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ภาษา</p>
            <p className="font-medium">{getLanguageLabel(selectedRequest.addr_lang)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">วันที่ขอแก้ไข</p>
            <p className="font-medium">{formatDate(selectedRequest.request_date)}</p>
          </div>
        </div>
      </div>
      
      {/* Address Comparison Tabs */}
      <div className="border-b">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'old' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('old')}
          >
            ที่อยู่เดิม
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'new' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('new')}
          >
            ที่อยู่ใหม่
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'diff' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('diff')}
          >
            เปรียบเทียบการเปลี่ยนแปลง
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'old' && (
            <div>
              <h3 className="font-bold mb-2">ที่อยู่เดิม</h3>
              {formatFullAddress(oldAddress)}
            </div>
          )}
          
          {activeTab === 'new' && (
            <div>
              <h3 className="font-bold mb-2">ที่อยู่ใหม่</h3>
              {formatFullAddress(newAddress)}
            </div>
          )}
          
          {activeTab === 'diff' && (
            <div>
              <h3 className="font-bold mb-2">การเปลี่ยนแปลง</h3>
              {changes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ฟิลด์</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ค่าเดิม</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ค่าใหม่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {changes.map((change, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{change.field}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 bg-red-50">{change.oldValue}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 bg-green-50">{change.newValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">ไม่พบการเปลี่ยนแปลงข้อมูล</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Admin Actions */}
      {selectedRequest.status === 'pending' && (
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
              บันทึกช่วยจำ (เฉพาะเจ้าหน้าที่)
            </label>
            <textarea
              id="adminNotes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
              rows="3"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่ (เฉพาะแอดมินเท่านั้นที่จะเห็นข้อความนี้)"
            />
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
              onClick={handleApprove}
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังดำเนินการ...
                </>
              ) : (
                'อนุมัติ'
              )}
            </motion.button>
            
            <motion.button
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
              onClick={onRejectClick}
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ปฏิเสธ
            </motion.button>
          </div>
        </div>
      )}
      
      {/* Show processed info if not pending */}
      {selectedRequest.status !== 'pending' && selectedRequest.processed_date && (
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="font-medium">วันที่ดำเนินการ:</span> {formatDate(selectedRequest.processed_date)}
          </p>
          {selectedRequest.admin_notes && (
            <p className="text-sm text-gray-600 mt-1 bg-yellow-50 p-2 border border-yellow-200 rounded">
              <span className="font-medium">บันทึกช่วยจำ (เฉพาะเจ้าหน้าที่):</span> {selectedRequest.admin_notes}
            </p>
          )}
          {selectedRequest.admin_comment && (
            <p className="text-sm text-gray-600 mt-1 bg-red-50 p-2 border border-red-200 rounded">
              <span className="font-medium">เหตุผลที่ปฏิเสธ:</span> {selectedRequest.admin_comment}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
