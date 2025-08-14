import React from 'react';

const ApplicantInfoSection = ({ application, type }) => {
  if (!application) return null;
  
  const isIC = type === 'ic';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        {isIC ? 'ข้อมูลผู้สมัคร' : 'ข้อมูลผู้ยื่นคำขอ'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-lg text-gray-900">
            {`${application.firstNameTh || ''} ${application.lastNameTh || ''}`.trim() || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-lg text-gray-900">
            {`${application.firstNameEn || ''} ${application.lastNameEn || ''}`.trim() || '-'}
          </p>
        </div>
        {isIC && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เลขบัตรประชาชน</p>
            <p className="text-lg text-gray-900 font-mono">{application.idCard || '-'}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
          <p className="text-lg text-gray-900">{application.email || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
          <p className="text-lg text-gray-900">{application.phone || '-'}</p>
        </div>
        {application.website && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">เว็บไซต์</p>
            <p className="text-lg text-gray-900">{application.website}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantInfoSection;