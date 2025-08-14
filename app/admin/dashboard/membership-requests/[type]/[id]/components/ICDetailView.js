import React, { useState } from 'react';
import ApprovalModal from '../../../components/modals/ApprovalModal';
import { MEMBER_TYPES } from '../../../ีutils/constants';

const ICDetailView = ({ 
  application, 
  industrialGroups, 
  provincialChapters, 
  handleViewDocument,
  handlePrint,
  handleSaveNote,
  handleApprove,
  handleReject,
  adminNote,
  setAdminNote,
  isSubmitting,
  handleConnectMemberCode,
  type = 'ic' // Add type prop with default value
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Handle approval modal
  const handleApproveClick = () => {
    setShowApprovalModal(true);
  };

  const handleApprovalConfirm = () => {
    setShowApprovalModal(false);
    handleApprove();
  };

  const handleApprovalCancel = () => {
    setShowApprovalModal(false);
  };

  // Get member type info
  const memberTypeInfo = MEMBER_TYPES[type] || { code: 'N/A', name: 'ไม่ทราบประเภท' };
  
  // Get company name (for IC, it's usually personal name)
  const getDisplayName = () => {
    if (application?.first_name_th && application?.last_name_th) {
      return `${application.first_name_th} ${application.last_name_th}`;
    }
    if (application?.firstNameTh && application?.lastNameTh) {
      return `${application.firstNameTh} ${application.lastNameTh}`;
    }
    if (application?.name) return application.name;
    return 'ไม่ระบุ';
  };

  // Get ID card number
  const getIdCard = () => {
    if (application?.id_card_number) return application.id_card_number;
    if (application?.idCard) return application.idCard;
    return 'ไม่ระบุ';
  };
  
  // Function to get document display name based on document type
  const getDocumentDisplayName = (doc) => {
    if (doc.document_name) {
      return doc.document_name;
    }
    
    // Map document types to Thai names for IC membership
    const documentTypeNames = {
      'id_card': 'สำเนาบัตรประชาชน',
      'authorized_signature': 'รูปลายเซ็นผู้มีอำนาจลงนาม'
    };
    
    return documentTypeNames[doc.document_type] || doc.document_type || `เอกสารแนบ`;
  };
  
  const onConnectMemberCode = async () => {
    if (!application || !application.id_card_number) return;
    
    setIsConnecting(true);
    try {
      await handleConnectMemberCode(application.id);
    } finally {
      setIsConnecting(false);
    }
  };
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Print Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            พิมพ์
          </button>
        </div>

        {/* 1. ข้อมูลบริษัท */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ข้อมูลบริษัท
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
              <p className="text-lg text-gray-900">{application.first_name_th || application.firstNameTh || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
              <p className="text-lg text-gray-900">{application.last_name_th || application.lastNameTh || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
              <p className="text-lg text-gray-900">{application.first_name_en || application.firstNameEn || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
              <p className="text-lg text-gray-900">{application.last_name_en || application.lastNameEn || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เลขบัตรประชาชน</p>
              <p className="text-lg text-gray-900 font-mono">{application.id_card_number || application.idCard || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              <p className="text-lg text-gray-900">{application.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              <p className="text-lg text-gray-900">{application.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
              <p className="text-lg text-gray-900">{application.website || '-'}</p>
            </div>
          </div>
        </div>

        {/* 2. สภาจังหวัด / กลุ่มอุตสาหกรรม */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            สภาจังหวัด / กลุ่มอุตสาหกรรม
          </h3>
          
          {/* Debug: แสดงข้อมูลดิบเพื่อตรวจสอบ */}
          {console.log('IC industrialGroupIds:', application.industrialGroupIds)}
          {console.log('IC provincialChapterIds:', application.provincialChapterIds)}
          {console.log('industrialGroups mapping:', industrialGroups)}
          {console.log('provincialChapters mapping:', provincialChapters)}
          
          {/* สภาอุตสาหกรรมจังหวัด */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
            {application.provincialChapterIds && application.provincialChapterIds.length > 0 ? (
              <div className="space-y-3">
                {application.provincialChapterIds.map((chapter, index) => {
                  console.log('Processing provincial chapter:', chapter);
                  const chapterId = chapter.id || chapter.province_chapter_id || chapter;
                  return (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-lg font-medium text-gray-900">
                        {provincialChapters[chapterId] || `รหัส: ${chapterId}`}
                      </p>
                      {provincialChapters[chapterId] && (
                        <p className="text-sm text-blue-600">รหัส: {chapterId}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500">ไม่มีข้อมูلสภาอุตสาหกรรมจังหวัด</p>
              </div>
            )}
          </div>

          {/* กลุ่มอุตสาหกรรม */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
            {application.industrialGroupIds && application.industrialGroupIds.length > 0 ? (
              <div className="space-y-3">
                {application.industrialGroupIds.map((group, index) => {
                  console.log('Processing industrial group:', group);
                  const groupId = group.id || group.industry_group_id || group;
                  return (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-lg font-medium text-gray-900">
                        {industrialGroups[groupId] || `รหัส: ${groupId}`}
                      </p>
                      {industrialGroups[groupId] && (
                        <p className="text-sm text-blue-600">รหัส: {groupId}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500">ไม่มีข้อมูลกลุ่มอุตสาหกรรม</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. ผู้แทน */}
        {application.representatives && application.representatives.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ผู้แทน
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {application.representatives.map((rep, index) => {
                const isPrimary = rep.repOrder === 1 || rep.isPrimary === 1 || rep.isPrimary === true;
                const repType = isPrimary ? 'ผู้แทน 1 (หลัก)' : 'ผู้แทน 2 (รอง)';
                
                return (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-blue-900">{repType}</h4>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {isPrimary ? 'หลัก' : 'รอง'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                          <p className="text-sm text-gray-900">{rep.firstNameTh || rep.first_name_th || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                          <p className="text-sm text-gray-900">{rep.lastNameTh || rep.last_name_th || '-'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{rep.firstNameEn || rep.first_name_en || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{rep.lastNameEn || rep.last_name_en || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                        <p className="text-sm text-gray-900">{rep.position || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                          <p className="text-sm text-gray-900">{rep.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                          <p className="text-sm text-gray-900 break-all">{rep.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. ที่อยู่จัดส่ง */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ที่อยู่จัดส่ง
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
              <p className="text-lg text-gray-900">{application.address_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
              <p className="text-lg text-gray-900">{application.moo || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
              <p className="text-lg text-gray-900">{application.soi || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
              <p className="text-lg text-gray-900">{application.street || application.road || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
              <p className="text-lg text-gray-900">{application.sub_district || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
              <p className="text-lg text-gray-900">{application.district || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
              <p className="text-lg text-gray-900">{application.province || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
              <p className="text-lg text-gray-900 font-mono">{application.postal_code || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              <p className="text-lg text-gray-900">{application.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              <p className="text-lg text-gray-900">{application.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
              <p className="text-lg text-gray-900">{application.website || '-'}</p>
            </div>
          </div>
        </div>

        {/* 5. ข้อมูลธุรกิจ */}
        {((application.businessTypes && application.businessTypes.length > 0) || 
          (application.products && application.products.length > 0) ||
          (application.businessTypeOther)) && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ข้อมูลธุรกิจ
            </h3>
            
            {/* ประเภทธุรกิจ */}
            {application.businessTypes && application.businessTypes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
                <div className="flex flex-wrap gap-3">
                  {application.businessTypes.map((businessType, index) => {
                    const getBusinessTypeName = (type) => {
                      const types = {
                        'manufacturer': 'ผู้ผลิต',
                        'distributor': 'ผู้จัดจำหน่าย',
                        'importer': 'ผู้นำเข้า',
                        'exporter': 'ผู้ส่งออก',
                        'service': 'ผู้ให้บริการ',
                        'other': 'อื่นๆ'
                      };
                      return types[type] || type;
                    };
                    
                    return (
                      <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                        {getBusinessTypeName(businessType.business_type || businessType)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ประเภทธุรกิจอื่นๆ */}
            {application.businessTypeOther && (
              <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจอื่นๆ</h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-lg text-gray-900">
                    {typeof application.businessTypeOther === 'string' 
                      ? application.businessTypeOther 
                      : application.businessTypeOther.detail || 
                        application.businessTypeOther.other_type || 
                        'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            )}
            
            {/* สินค้าและบริการ */}
            {application.products && application.products.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.products.map((product, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-lg font-bold text-blue-900 mb-3">สินค้า/บริการ {index + 1}</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (ไทย)</p>
                          <p className="text-sm text-gray-900">{product.name_th || product.nameTh || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                          <p className="text-sm text-gray-900">{product.name_en || product.nameEn || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. ไฟล์แนบ - Hidden in print */}
        {application.documents && application.documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
              ไฟล์แนบ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.documents.map((doc, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1">{getDocumentDisplayName(doc)}</p>
                    <p className="text-sm text-gray-600 truncate" title={doc.file_path || '-'}>
                      {doc.file_path || '-'}
                    </p>
                  </div>
                  {doc.file_path && (
                    <button 
                      onClick={() => handleViewDocument(doc.file_path)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      title="ดูเอกสาร"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      ดู
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. การอนุมัติ - Hidden in print */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            การอนุมัติ
          </h3>
          
          {/* หมายเหตุของผู้ดูแลระบบ */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">หมายเหตุของผู้ดูแลระบบ</h4>
            <div className="mb-4">
              <textarea
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="4"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
              />
            </div>
            
            <div className="flex justify-end mb-6">
              <button
                onClick={handleSaveNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          {application.status !== 1 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">การดำเนินการ</h4>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleReject}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
                </button>
                <button
                  onClick={handleApproveClick}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                </button>
              </div>
            </div>
          )}
          
          
          {/* Show Member Code if available */}
          {application.status === 1 && application.member_code && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
              <p className="text-xl font-bold text-green-700">{application.member_code}</p>
              <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={handleApprovalCancel}
        onConfirm={handleApprovalConfirm}
        isSubmitting={isSubmitting}
        applicationData={{
          memberType: `${memberTypeInfo.code} - ${memberTypeInfo.name}`,
          companyName: getDisplayName(),
          taxId: getIdCard()
        }}
      />
    </div>
  );
};

export default ICDetailView;