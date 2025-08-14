import React from 'react';

const ContactPersonSection = ({ application }) => {
  if (!application?.contactPerson) return null;
  
  const contact = application.contactPerson;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลผู้ติดต่อ
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-lg text-gray-900">
            {`${contact.firstNameTh || ''} ${contact.lastNameTh || ''}`.trim() || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-lg text-gray-900">
            {`${contact.firstNameEn || ''} ${contact.lastNameEn || ''}`.trim() || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
          <p className="text-lg text-gray-900">{contact.position || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
          <p className="text-lg text-gray-900">{contact.email || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
          <p className="text-lg text-gray-900">
            {contact.phone || '-'}
            {contact.phoneExtension && ` ต่อ ${contact.phoneExtension}`}
          </p>
        </div>
        {contact.typeContactName && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทผู้ติดต่อ</p>
            <p className="text-lg text-gray-900">{contact.typeContactName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPersonSection;