import React from 'react';

const ContactPersonSection = ({ application }) => {
  if (!application) return null;

  // Check if we have contact persons data
  const hasContactPersons = application.contactPersons && application.contactPersons.length > 0;

  if (!hasContactPersons) return null;

  // Contact person type mapping
  const getContactTypeDisplay = (typeId, typeName, otherDetail) => {
    if (typeName) {
      return typeName;
    }
    
    // Fallback mapping for common type IDs
    const typeMapping = {
      1: 'ผู้จัดการ',
      2: 'เลขานุการ',
      3: 'ผู้ประสานงาน',
      4: 'อื่นๆ'
    };
    
    const displayName = typeMapping[typeId] || `ประเภท ${typeId}`;
    
    // If it's "อื่นๆ" type and has other detail, show the detail
    if ((typeId === 4 || displayName === 'อื่นๆ') && otherDetail) {
      return `${displayName}: ${otherDetail}`;
    }
    
    return displayName;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลผู้ติดต่อ ({application.contactPersons.length} คน)
      </h3>
      
      <div className="space-y-6">
        {application.contactPersons.map((contact, index) => (
          <div key={index} className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-blue-900">
                ผู้ติดต่อคนที่ {index + 1}
              </h4>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {getContactTypeDisplay(contact.type_contact_id, contact.type_contact_name, contact.type_contact_other_detail)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
                <p className="text-sm text-gray-900">{contact.first_name_th || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
                <p className="text-sm text-gray-900">{contact.last_name_th || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
                <p className="text-sm text-gray-900">{contact.first_name_en || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
                <p className="text-sm text-gray-900">{contact.last_name_en || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
                <p className="text-sm text-gray-900">{contact.position || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
                <p className="text-sm text-gray-900">{contact.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-sm text-gray-900">
                  {contact.phone || '-'}
                  {(contact.phone_extension || contact.phoneExtension) && (
                    <span className="text-blue-600 ml-2">ต่อ {contact.phone_extension || contact.phoneExtension}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPersonSection;
