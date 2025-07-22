import React, { useState, useEffect } from 'react';
import ApplicantInfoSection from './ApplicantInfoSection';
import AddressSection from './AddressSection';
import BusinessInfoSection from './BusinessInfoSection';
import RepresentativesSection from './RepresentativesSection';
import GroupsSection from './GroupsSection';
import DocumentsSection from './DocumentsSection';
import ICDetailView from './ICDetailView';

const MembershipDetailView = ({ 
  application, 
  type, 
  handleViewDocument, 
  handleApprove, 
  handleReject,
  handleSaveNote,
  isSubmitting,
  adminNote,
  setAdminNote,
  handlePrint
}) => {
  const [industrialGroups, setIndustrialGroups] = useState({});
  const [provincialChapters, setProvincialChapters] = useState({});
  const [noteSaved, setNoteSaved] = useState(false);

  // Fetch industrial groups and provincial chapters data
  useEffect(() => {
    const fetchGroupsData = async () => {
      try {
        // Fetch industrial groups
        const industrialResponse = await fetch('/api/industrial-groups');
        if (industrialResponse.ok) {
          const industrialResult = await industrialResponse.json();
          const industrialData = industrialResult.data || industrialResult;
          const industrialMap = {};
          industrialData.forEach(group => {
            industrialMap[group.MEMBER_GROUP_CODE] = group.MEMBER_GROUP_NAME;
          });
          setIndustrialGroups(industrialMap);
        }

        // Fetch provincial chapters
        const provincialResponse = await fetch('/api/provincial-chapters');
        if (provincialResponse.ok) {
          const provincialResult = await provincialResponse.json();
          const provincialData = provincialResult.data || provincialResult;
          const provincialMap = {};
          provincialData.forEach(chapter => {
            provincialMap[chapter.MEMBER_GROUP_CODE] = chapter.MEMBER_GROUP_NAME;
          });
          setProvincialChapters(provincialMap);
        }
      } catch (error) {
        console.error('Error fetching groups data:', error);
      }
    };

    fetchGroupsData();
  }, []);

  if (!application) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">ไม่พบข้อมูลการสมัครสมาชิก</p>
      </div>
    );
  }

  // Render IC detail view (uses its own comprehensive component)
  if (type === 'ic') {
    return (
      <div>
        <ICDetailView 
          application={application}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          handleViewDocument={handleViewDocument}
          handlePrint={handlePrint}
          handleSaveNote={handleSaveNote}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          isSubmitting={isSubmitting}
        />
        
        {/* Admin Action Buttons - Only approve/reject buttons */}
        {application.status !== 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6 print:hidden">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">การดำเนินการ</h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render other membership types (OC, AM, AC)
  return (
    <div className="space-y-6">
      {/* Print Button - Top Right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          พิมพ์
        </button>
      </div>

      {/* Company/Applicant Information */}
      <ApplicantInfoSection application={application} type={type} />
      
      {/* Address Information */}
      <AddressSection address={application} />
      
      {/* ข้อมูลผู้ติดต่อ - สำหรับ OC, AM, AC */}
      {type !== 'ic' && ((application.contactPersons && application.contactPersons.length > 0) || (application.contactPerson && application.contactPerson.length > 0)) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้ติดต่อ</h3>
          {(application.contactPersons || application.contactPerson || []).map((contact, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 border border-gray-100 rounded-lg">
              <div>
                <p className="text-gray-600 text-sm">ชื่อ-สกุล (ไทย)</p>
                <p className="font-medium">{(contact.first_name_th || contact.firstNameTh || '') + ' ' + (contact.last_name_th || contact.lastNameTh || '')}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">ชื่อ-สกุล (อังกฤษ)</p>
                <p className="font-medium">{(contact.first_name_en || contact.firstNameEn || '') + ' ' + (contact.last_name_en || contact.lastNameEn || '')}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                <p className="font-medium">{contact.position || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">อีเมล</p>
                <p className="font-medium">{contact.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                <p className="font-medium">{contact.phone || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Representatives */}
      <RepresentativesSection representatives={application.representatives} />
      
      {/* Business Information */}
      <BusinessInfoSection 
        businessTypes={application.businessTypes} 
        products={application.products} 
        businessTypeOther={['oc', 'ac'].includes(type) ? application.businessTypeOther : null}
      />
      
      {/* Industrial Groups and Provincial Chapters */}
      <GroupsSection 
        industrialGroupIds={application.industrialGroupIds}
        provincialChapterIds={application.provincialChapterIds}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
      />
      
      {/* Documents - Hidden in print */}
      <div className="print:hidden">
        <DocumentsSection 
          documents={application.documents} 
          handleViewDocument={handleViewDocument} 
        />
      </div>
      
      {/* Admin Actions - Hidden in print */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6 print:hidden">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">การดำเนินการของผู้ดูแลระบบ</h3>
        
        {/* Admin Note */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700">หมายเหตุของผู้ดูแลระบบ</label>
            {application.adminNoteAt && (
              <span className="text-sm text-gray-500">
                บันทึกเมื่อ: {new Date(application.adminNoteAt).toLocaleString('th-TH')}
              </span>
            )}
          </div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSaveNote}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
            </button>
            {noteSaved && (
              <div className="text-green-600 text-sm mt-2">บันทึกหมายเหตุสำเร็จแล้ว</div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {application.status !== 1 && (
            <>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipDetailView;