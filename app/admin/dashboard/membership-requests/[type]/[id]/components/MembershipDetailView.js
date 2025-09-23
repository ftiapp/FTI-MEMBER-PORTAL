import React, { useState, useEffect } from 'react';
import ApplicantInfoSection from './ApplicantInfoSection';
import CompanyInfoSection from './CompanyInfoSection';
import ContactPersonSection from './ContactPersonSection';
import IndustrialGroupsSection from './IndustrialGroupsSection';
import FinancialInfoSection from './FinancialInfoSection';
import RepresentativesSection from './RepresentativesSection';
import AddressSection from './AddressSection';
import ProductsSection from './ProductsSection';
import DocumentsSection from './DocumentsSection';
import AdminActionsSection from './AdminActionsSection';
import PDFDownloadButton from './PDFDownloadButton';
import { getMemberTypeInfo } from '../../../ีutils/dataTransformers';

const MembershipDetailView = ({ 
  application, 
  type, 
  onApprove, 
  onReject, 
  onViewDocument, 
  onAdminNoteChange, 
  adminNote, 
  isProcessing 
}) => {
  const [localAdminNote, setLocalAdminNote] = useState(adminNote || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local admin note with prop
  useEffect(() => {
    setLocalAdminNote(adminNote || '');
  }, [adminNote]);


  // Helper functions
  const getDocumentDisplayName = (doc) => {
    const documentTypes = {
      'certificate': 'หนังสือรับรองการจดทะเบียน',
      'financial': 'งบการเงิน',
      'tax': 'ใบรับรองภาษี',
      'other': 'เอกสารอื่นๆ'
    };
    return documentTypes[doc.type] || doc.name || 'เอกสาร';
  };

  const handleViewDocument = (filePath) => {
    if (onViewDocument) {
      onViewDocument(filePath);
    }
  };

  const handleSaveNote = async () => {
    setIsSubmitting(true);
    try {
      if (onAdminNoteChange) {
        await onAdminNoteChange(localAdminNote);
      }
    } catch (error) {
      console.error('Error saving admin note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      if (onApprove) {
        await onApprove();
      }
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      if (onReject) {
        await onReject();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">ไม่พบข้อมูลใบสมัคร</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with PDF Download */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">รายละเอียดใบสมัครสมาชิก</h2>
            <p className="text-blue-100 text-lg">
              {(() => { const t = getMemberTypeInfo(type); return `ประเภท: ${t.code} (${t.name})`; })()}
            </p>
            {application.member_code && (
              <p className="text-blue-100 mt-2">
                <span className="font-semibold">รหัสสมาชิก:</span> {application.member_code}
              </p>
            )}
          </div>
          <PDFDownloadButton application={application} type={type} />
        </div>
      </div>

      {/* Applicant Info Section */}
      <ApplicantInfoSection application={application} type={type} />

      {/* Company Info Section */}
      <CompanyInfoSection application={application} type={type} />

      {/* Contact Person Section */}
      <ContactPersonSection application={application} />

      {/* Industrial Groups Section */}
      <IndustrialGroupsSection 
        application={application} 
      />

      {/* Financial Info Section */}
      <FinancialInfoSection application={application} type={type} />

      {/* Representatives Section */}
      <RepresentativesSection representatives={application.representatives || application.reps || application.representative || []} />

      {/* Address Section */}
      <AddressSection application={application} />

      {/* Products Section */}
      <ProductsSection application={application} type={type} />

      {/* Contact Person Section */}
      {(() => {
        const reps = application.representatives || application.reps || application.representative || [];
        const primaryRep = Array.isArray(reps)
          ? (reps.find(r => r.rep_order === 1 || r.is_primary === 1 || r.is_primary === true) || reps[0])
          : null;

        let contact = application.contactPerson 
          || application.contact_person 
          || application.contact 
          || (Array.isArray(application.contacts) ? application.contacts[0] : null)
          || primaryRep;

        // If still no contact, synthesize from root-level fields
        if (!contact) {
          const fromApp = (keys) => keys.reduce((v, k) => (v != null && v !== '' ? v : application?.[k]), undefined);
          const synth = {
            first_name_th: fromApp(['contact_first_name_th','contactFirstNameTh','contact_firstname_th','contactFirstnameTh']),
            last_name_th:  fromApp(['contact_last_name_th','contactLastNameTh','contact_lastname_th','contactLastnameTh']),
            first_name_en: fromApp(['contact_first_name_en','contactFirstNameEn','contact_firstname_en','contactFirstnameEn']),
            last_name_en:  fromApp(['contact_last_name_en','contactLastNameEn','contact_lastname_en','contactLastnameEn']),
            email:         fromApp(['contact_email','contactEmail','email_contact','emailContact']),
            phone:         fromApp(['contact_phone','contactPhone','contact_tel','contactTel','contact_mobile','contactMobile','phone_number','phoneNumber']),
            position:      fromApp(['contact_position','contactPosition','contact_title','contactTitle'])
          };
          const hasAny = Object.values(synth).some(v => v != null && v !== '');
          if (hasAny) contact = synth;
        }

        const pick = (obj, keys) => keys.reduce((v, k) => (v != null && v !== '' ? v : obj?.[k]), undefined);
        // Try to derive first/last names with many variants
        let firstNameTh = pick(contact || {}, ['first_name_th','firstNameTh','name_th','nameTh','firstname_th','firstnameTh','contactFirstNameTh','contact_first_name_th']);
        let lastNameTh  = pick(contact || {}, ['last_name_th','lastNameTh','surname_th','surnameTh','lastname_th','lastnameTh','contactLastNameTh','contact_last_name_th']);
        let firstNameEn = pick(contact || {}, ['first_name_en','firstNameEn','name_en','nameEn','firstname_en','firstnameEn','contactFirstNameEn','contact_first_name_en']);
        let lastNameEn  = pick(contact || {}, ['last_name_en','lastNameEn','surname_en','surnameEn','lastname_en','lastnameEn','contactLastNameEn','contact_last_name_en']);
        const email       = pick(contact || {}, ['email','contact_email','mail','contactEmail']);
        const phone       = pick(contact || {}, ['phone','tel','telephone','mobile','mobile_phone','contact_phone','contactTel','contactMobile']);
        const position    = pick(contact || {}, ['position','title','role','contact_position','contactTitle']);

        // If only full name provided, try split by space (Thai/English)
        const fullTh = pick(contact || {}, ['full_name_th','fullNameTh','contact_name_th','contactNameTh','name_th_full']);
        if ((!firstNameTh && !lastNameTh) && fullTh) {
          const parts = String(fullTh).trim().split(/\s+/);
          firstNameTh = parts[0] || '';
          lastNameTh = parts.slice(1).join(' ') || '';
        }
        const fullEn = pick(contact || {}, ['full_name_en','fullNameEn','contact_name_en','contactNameEn','name_en_full','fullName','name']);
        if ((!firstNameEn && !lastNameEn) && fullEn) {
          const parts = String(fullEn).trim().split(/\s+/);
          firstNameEn = parts[0] || '';
          lastNameEn = parts.slice(1).join(' ') || '';
        }

        return contact ? (
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ข้อมูลผู้ติดต่อ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
              <p className="text-lg text-gray-900">
                {`${firstNameTh || ''} ${lastNameTh || ''}`.trim() || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
              <p className="text-lg text-gray-900">
                {`${firstNameEn || ''} ${lastNameEn || ''}`.trim() || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
              <p className="text-lg text-gray-900">{position || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              <p className="text-lg text-gray-900">{email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              <p className="text-lg text-gray-900 font-mono">{phone || '-'}</p>
            </div>
          </div>
        </div>
        ) : null;
      })()}

      {/* Business Information Section */}
      {((application.businessTypes && (Array.isArray(application.businessTypes) ? application.businessTypes.length > 0 : Object.keys(application.businessTypes).length > 0)) || 
        (application.products && application.products.length > 0)) && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            ข้อมูลธุรกิจ
          </h3>
          
          {/* Business Types */}
          {application.businessTypes && (Array.isArray(application.businessTypes) ? application.businessTypes.length > 0 : Object.keys(application.businessTypes).length > 0) && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-4 text-gray-800">ประเภทธุรกิจ</h4>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(application.businessTypes) ? 
                  application.businessTypes.map((businessType, index) => {
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

                    if (businessType.business_type === 'other' && application.businessTypeOther && application.businessTypeOther.length > 0) {
                      const otherDetail = application.businessTypeOther.find(other => other.main_id === businessType.main_id);
                      return (
                        <span key={index} className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                          อื่นๆ: {otherDetail?.detail || 'ไม่ระบุ'}
                        </span>
                      );
                    }
                    return (
                      <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                        {getBusinessTypeName(businessType.business_type)}
                      </span>
                    );
                  })
                  : 
                  Object.entries(application.businessTypes).map(([key, value], index) => {
                    if (!value) return null;
                    
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

                    if (key === 'other' && application.businessTypeOther) {
                      const otherDetail = typeof application.businessTypeOther === 'string' 
                        ? application.businessTypeOther 
                        : application.businessTypeOther.detail || 
                          (application.businessTypeOther.other_detail) || 
                          '';
                          
                      return (
                        <span key={index} className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                          อื่นๆ: {otherDetail || 'ไม่ระบุ'}
                        </span>
                      );
                    }
                    return (
                      <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                        {getBusinessTypeName(key)}
                      </span>
                    );
                  }).filter(Boolean)
                }
              </div>
            </div>
          )}
          
          {/* Products and Services */}
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
                        <p className="text-sm text-gray-900">{product.name_th || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                        <p className="text-sm text-gray-900">{product.name_en || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Section */}
      {application.documents && application.documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
            เอกสารแนบ
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

      {/* Admin Actions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
          การดำเนินการของผู้ดูแลระบบ
        </h3>
        
        {/* Admin Note */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-lg font-semibold text-gray-800">หมายเหตุของผู้ดูแลระบบ</label>
            {application.adminNoteAt && (
              <span className="text-sm text-gray-500">
                บันทึกเมื่อ: {new Date(application.adminNoteAt).toLocaleString('th-TH')}
              </span>
            )}
          </div>
          <textarea
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="4"
            value={localAdminNote}
            onChange={(e) => setLocalAdminNote(e.target.value)}
            placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
          />
          <div className="mt-3 flex justify-end">
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
              onClick={handleApprove}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
            </button>
          </div>
        )}
        
        {/* Show Member Code if available */}
        {application.status === 1 && application.member_code && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
            <p className="text-xl font-bold text-green-700">{application.member_code}</p>
            <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipDetailView;