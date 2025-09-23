import React, { useState } from 'react';
import ApprovalModal from '../../../components/modals/ApprovalModal';
import { normalizeAllAddresses } from '../../../ีutils/dataTransformers';
import ApplicantInfoSection from '../../../components/sections/ApplicantInfoSection';
import DocumentsSection from '../../../components/sections/DocumentsSection';

const MEMBER_TYPES = {
  oc: { code: 'สน', name: 'สมาชิกสามัญ - โรงงาน' },
  am: { code: 'สส', name: 'สมาชิกสามัญ-สมาคมการค้า' },
  ac: { code: 'ทน', name: 'สมทบ-นิติบุคคล' },
  ic: { code: 'ทบ', name: 'สมทบ-บุคคลธรรมดา' },
};

const BUSINESS_TYPE_NAMES = {
  manufacturer: 'ผู้ผลิต',
  distributor: 'ผู้จัดจำหน่าย',
  importer: 'ผู้นำเข้า',
  exporter: 'ผู้ส่งออก',
  service: 'ผู้ให้บริการ',
  service_provider: 'ผู้ให้บริการ',
  other: 'อื่นๆ'
};

const DOCUMENT_TYPE_NAMES = {
  id_card: 'สำเนาบัตรประชาชน',
  authorized_signature: 'รูปลายเซ็นผู้มีอำนาจลงนาม'
};

const ICDetailView = ({ 
  application, 
  industrialGroups = {}, 
  provincialChapters = {}, 
  // Prefer on* props from parent page, fall back to legacy handle* props
  onViewDocument,
  handleViewDocument,
  onSaveNote,
  handleSaveNote,
  adminNote = '',
  onAdminNoteChange,
  setAdminNote,
  isSubmitting = false,
  handleConnectMemberCode,
  onApprove,
  handleApprove,
  onReject,
  handleReject,
  onOpenRejectModal,
  type = 'ic',
  onDownload
}) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const viewDocument = onViewDocument || handleViewDocument;
  const saveNote = onSaveNote || handleSaveNote;
  const approveFn = onApprove || handleApprove;
  const rejectFn = onReject || handleReject;
  const openReject = onOpenRejectModal || rejectFn;
  const setNote = onAdminNoteChange || setAdminNote;
  
  // Utility functions
  const safeValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'object') return '-';
    return String(value);
  };

  // Use shared DocumentsSection for consistent preview and download behavior
  const renderDocuments = () => {
    return (
      <DocumentsSection application={application} />
    );
  };

  const getMemberTypeInfo = () => {
    return MEMBER_TYPES[type] || { code: 'N/A', name: 'ไม่ทราบประเภท' };
  };

  const getDisplayName = () => {
    const firstTh = application?.first_name_th || application?.firstNameTh;
    const lastTh = application?.last_name_th || application?.lastNameTh;
    if (firstTh && lastTh) {
      return `${firstTh} ${lastTh}`;
    }
    return safeValue(application?.name || application?.company_name_th);
  };

  const getDisplayNameEn = () => {
    const firstEn = application?.first_name_en || application?.firstNameEn;
    const lastEn = application?.last_name_en || application?.lastNameEn;
    if (firstEn && lastEn) {
      return `${firstEn} ${lastEn}`;
    }
    // Fallback to any available English company name if exists, otherwise '-'
    const fallback = application?.company_name_en || application?.companyNameEn;
    return safeValue(fallback);
  };

  const getIdCard = () => {
    return safeValue(application?.id_card_number || application?.idCard);
  };

  const getBusinessTypeName = (businessType) => {
    if (!businessType) return '-';
    
    if (typeof businessType === 'string') {
      if (businessType === 'other') {
        const detail = typeof application?.businessTypeOther === 'string' ? application.businessTypeOther : '';
        return `${BUSINESS_TYPE_NAMES.other} (${detail || ''})`;
      }
      return BUSINESS_TYPE_NAMES[businessType] || businessType;
    }
    
    if (typeof businessType === 'object') {
      const key = businessType.business_type || businessType.type || businessType.businessType;
      if (key) {
        if (key === 'other') {
          const inlineDetail = typeof businessType.detail === 'string' ? businessType.detail : '';
          const fallbackDetail = typeof application?.businessTypeOther === 'string' ? application.businessTypeOther : '';
          const detail = inlineDetail || fallbackDetail || '';
          return `${BUSINESS_TYPE_NAMES.other} (${detail})`;
        }
        return BUSINESS_TYPE_NAMES[key] || key;
      }
    }
    
    return '-';
  };

  const getDocumentName = (doc) => {
    if (!doc) return 'เอกสารแนบ';
    
    if (doc.document_name) {
      return doc.document_name;
    }
    
    return DOCUMENT_TYPE_NAMES[doc.document_type] || doc.document_type || 'เอกสารแนบ';
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 1:
      case '1':
      case 'approved':
        return { text: 'อนุมัติ', className: 'bg-green-500 text-white' };
      case 2:
      case '2':
      case 'rejected':
        return { text: 'ปฏิเสธ', className: 'bg-red-500 text-white' };
      case 0:
      case '0':
      case 'pending':
        return { text: 'รอพิจารณา', className: 'bg-yellow-500 text-black' };
      default:
        return { text: 'รอพิจารณา', className: 'bg-yellow-500 text-black' };
    }
  };

  // Event handlers
  const handleApproveClick = () => setShowApprovalModal(true);
  const handleApprovalConfirm = () => {
    setShowApprovalModal(false);
    approveFn && approveFn();
  };
  const handleApprovalCancel = () => setShowApprovalModal(false);

  // Data processing
  const memberTypeInfo = getMemberTypeInfo();
  const statusInfo = getStatusDisplay(application?.status);
  const addresses = normalizeAllAddresses(application);
  
  const userInfo = {
    firstname: application?.user?.firstname || application?.applicant_firstname || application?.firstNameTh || '-',
    lastname: application?.user?.lastname || application?.applicant_lastname || application?.lastNameTh || '-',
    email: application?.user?.email || application?.applicant_email || application?.email || '-',
    phone: application?.user?.phone || application?.applicant_phone || application?.phone || '-'
  };

  // Render functions
  const renderIndustrialGroups = () => {
    const groups = application?.industrialGroups || application?.industrialGroupIds || [];
    
    if (!Array.isArray(groups) || groups.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500">ไม่มีข้อมูลกลุ่มอุตสาหกรรม</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {groups.map((group, index) => {
          let groupId = '';
          let groupName = '';

          if (typeof group === 'string' || typeof group === 'number') {
            groupId = String(group);
            groupName = industrialGroups[groupId] || `รหัส: ${groupId}`;
          } else if (group && typeof group === 'object') {
            groupId = String(group.id || group.industry_group_id || group.MEMBER_GROUP_CODE || '');
            groupName = group.name || group.industry_group_name || industrialGroups[groupId] || `รหัส: ${groupId}`;
          }

          if (!groupId) return null;

          return (
            <div key={`group-${index}-${groupId}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-medium text-gray-900">{groupName}</p>
              <p className="text-sm text-blue-600">รหัส: {groupId}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderProvincialChapters = () => {
    const chapters = application?.provincialChapters || application?.provincialChapterIds || [];
    
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500">ไม่มีข้อมูลสภาอุตสาหกรรมจังหวัด</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {chapters.map((chapter, index) => {
          let chapterId = '';
          let chapterName = '';

          if (typeof chapter === 'string' || typeof chapter === 'number') {
            chapterId = String(chapter);
            chapterName = provincialChapters[chapterId] || `รหัส: ${chapterId}`;
          } else if (chapter && typeof chapter === 'object') {
            chapterId = String(chapter.id || chapter.province_chapter_id || chapter.MEMBER_GROUP_CODE || '');
            chapterName = chapter.name || chapter.province_chapter_name || provincialChapters[chapterId] || `รหัส: ${chapterId}`;
          }

          if (!chapterId) return null;

          return (
            <div key={`chapter-${index}-${chapterId}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-medium text-gray-900">{chapterName}</p>
              <p className="text-sm text-blue-600">รหัส: {chapterId}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRepresentatives = () => {
    const representatives = application?.representatives || [];
    
    if (!Array.isArray(representatives) || representatives.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          ผู้แทน
        </h3>
        
        <div className="space-y-6">
          {representatives.slice(0, 1).map((rep, index) => {
            if (!rep || typeof rep !== 'object') return null;
            
            return (
              <div key={`rep-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.firstNameTh || rep.first_name_th)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.lastNameTh || rep.last_name_th)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.firstNameEn || rep.first_name_en)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.lastNameEn || rep.last_name_en)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.position)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                    <p className="text-lg text-gray-900">{safeValue(rep.phone)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                    <p className="text-lg text-gray-900 break-all">{safeValue(rep.email)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAddresses = () => {
    if (!addresses || addresses.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ที่อยู่
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500">ไม่มีข้อมูลที่อยู่</p>
          </div>
        </div>
      );
    }

    const getAddressStyles = (addressType) => {
      const styleMap = {
        '1': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
        '2': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
        '3': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' }
      };
      return styleMap[addressType] || styleMap['1'];
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          ที่อยู่
        </h3>
        
        {addresses.map((addr, index) => {
          const styles = getAddressStyles(addr.addressType);
          
          return (
            <div key={`address-${index}`} className={`${styles.bg} border ${styles.border} rounded-lg p-6 mb-6`}>
              <h4 className={`text-xl font-semibold ${styles.text} mb-4 border-b ${styles.border} pb-2`}>
                {addr.addressTypeName}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
                  <p className="text-base text-gray-900">{safeValue(addr.addressNumber)}</p>
                </div>
                {addr.building && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">อาคาร</p>
                    <p className="text-base text-gray-900">{addr.building}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
                  <p className="text-base text-gray-900">{safeValue(addr.moo)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
                  <p className="text-base text-gray-900">{safeValue(addr.soi)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
                  <p className="text-base text-gray-900">{safeValue(addr.street)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
                  <p className="text-base text-gray-900">{safeValue(addr.subDistrict)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
                  <p className="text-base text-gray-900">{safeValue(addr.district)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
                  <p className="text-base text-gray-900">{safeValue(addr.province)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
                  <p className="text-base text-gray-900 font-mono">{safeValue(addr.postalCode)}</p>
                </div>
                
                {addr.phone && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">โทรศัพท์</p>
                    <p className="text-base text-gray-900">
                      {addr.phone}
                      {addr.phoneExtension && ` ต่อ ${addr.phoneExtension}`}
                    </p>
                  </div>
                )}
                {addr.email && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                    <p className="text-base text-gray-900">{addr.email}</p>
                  </div>
                )}
                {addr.website && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
                    <p className="text-base text-gray-900">{addr.website}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBusinessInfo = () => {
    const hasBusinessTypes = application?.businessTypes && Array.isArray(application.businessTypes) && application.businessTypes.length > 0;
    const hasProducts = application?.products && Array.isArray(application.products) && application.products.length > 0;
    const hasBusinessTypeOther = application?.businessTypeOther;

    if (!hasBusinessTypes && !hasProducts && !hasBusinessTypeOther) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          ข้อมูลธุรกิจ
        </h3>
        
        {hasBusinessTypes && (
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
            <div className="flex flex-wrap gap-3">
              {application.businessTypes.map((businessType, index) => (
                <span key={`business-${index}`} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                  {getBusinessTypeName(businessType)}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasBusinessTypeOther && (
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจอื่นๆ</h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-lg text-gray-900">{safeValue(application.businessTypeOther)}</p>
            </div>
          </div>
        )}
        
        {hasProducts && (
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-800">สินค้าและบริการ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.products.map((product, index) => {
                if (!product || typeof product !== 'object') return null;
                
                return (
                  <div key={`product-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-lg font-bold text-blue-900 mb-3">สินค้า/บริการ {index + 1}</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (ไทย)</p>
                        <p className="text-sm text-gray-900">{safeValue(product.name_th || product.nameTh)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                        <p className="text-sm text-gray-900">{safeValue(product.name_en || product.nameEn)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderApprovalSection = () => {
    const isPending = application?.status === 0 || application?.status === '0' || application?.status === 'pending' || application?.status === undefined || application?.status === null;
    return (
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
              onChange={(e) => setNote && setNote(e.target.value)}
              placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
            />
          </div>
          
          {saveNote && (
            <div className="flex justify-end mb-6">
              <button
                onClick={saveNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
              </button>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {isPending && (approveFn || openReject) && (
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800">การดำเนินการ</h4>
            <div className="flex justify-end space-x-4">
              {openReject && (
                <button
                  onClick={openReject}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
                </button>
              )}
              {approveFn && (
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
              )}
            </div>
          </div>
        )}
        
        {/* Show Member Code if available */}
        {(application?.status === 1 || application?.status === '1' || application?.status === 'approved') && (application?.member_code || application?.memberCode) && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
            <p className="text-xl font-bold text-green-700">{safeValue(application.member_code || application.memberCode)}</p>
            <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
          </div>
        )}

        {/* Connect Member Code Button */}
        {(application?.status === 1 || application?.status === '1' || application?.status === 'approved') && !(application?.member_code || application?.memberCode) && handleConnectMemberCode && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-yellow-800">เชื่อมต่อฐานข้อมูลสมาชิก</h4>
            <button
              onClick={() => handleConnectMemberCode(application.id)}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              disabled={isSubmitting || !(application?.id_card_number || application?.idCard)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {isSubmitting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อฐานข้อมูลสมาชิก'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header is now provided by page.js (unified across member types) */}

      {/* ข้อมูลผู้สมัคร (moved to below documents) */}

      {/* ข้อมูลบริษัท */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          ข้อมูลบริษัท
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (ไทย)</p>
            <p className="text-lg text-gray-900">{getDisplayName()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อบริษัท (อังกฤษ)</p>
            <p className="text-lg text-gray-900">{getDisplayNameEn()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เลขประจำตัวผู้เสียภาษี</p>
            <p className="text-lg text-gray-900 font-mono">{getIdCard()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
            <p className="text-lg text-gray-900">{safeValue(application?.email)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
            <p className="text-lg text-gray-900">{safeValue(application?.phone)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            <p className="text-lg text-gray-900">{safeValue(application?.website)}</p>
          </div>
        </div>
      </div>

      {/* กลุ่มอุตสาหกรรมและสภาจังหวัด */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          กลุ่มอุตสาหกรรมและสภาจังหวัด
        </h3>
        
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
          {renderProvincialChapters()}
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
          {renderIndustrialGroups()}
        </div>
      </div>

      {/* ผู้แทน */}
      {renderRepresentatives()}

      {/* ที่อยู่ */}
      {renderAddresses()}

      {/* ข้อมูลธุรกิจ */}
      {renderBusinessInfo()}

      {/* ไฟล์แนบ */}
      {renderDocuments()}

      {/* ข้อมูลบัญชีผู้สมัคร */}
      <ApplicantInfoSection 
        application={application} 
        type={type} 
      />

      {/* การอนุมัติ */}
      {renderApprovalSection()}

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