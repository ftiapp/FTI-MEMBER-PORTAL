import React from 'react';

const AddressSection = ({ application }) => {
  // Check if we have multiple addresses or just one
  const hasMultipleAddresses = application?.addresses && application.addresses.length > 0;
  const hasSingleAddress = application?.address && !hasMultipleAddresses;
  
  if (!hasMultipleAddresses && !hasSingleAddress) return null;

  const renderAddressCard = (addr, title, index = 0) => (
    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h4 className="text-xl font-semibold text-blue-900 mb-4 border-b border-blue-300 pb-2">
        {title}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {addr.building && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อาคาร</p>
            <p className="text-base text-gray-900">{addr.building}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
          <p className="text-base text-gray-900">{addr.addressNumber || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
          <p className="text-base text-gray-900">{addr.moo || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
          <p className="text-base text-gray-900">{addr.soi || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
          <p className="text-base text-gray-900">{addr.street || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
          <p className="text-base text-gray-900">{addr.subDistrict || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
          <p className="text-base text-gray-900">{addr.district || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
          <p className="text-base text-gray-900">{addr.province || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
          <p className="text-base text-gray-900 font-mono">{addr.postalCode || '-'}</p>
        </div>
        
        {/* Additional contact info for addresses */}
        {(addr.phone || addr.email || addr.website) && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        ข้อมูลที่อยู่
      </h3>
      
      {hasMultipleAddresses ? (
        // Display all addresses with their types
        application.addresses.map((addr, index) => 
          renderAddressCard(addr, addr.addressTypeName || `ที่อยู่ประเภท ${addr.addressType}`, index)
        )
      ) : (
        // Display single address (fallback)
        renderAddressCard(application.address, 'ที่อยู่จัดส่งเอกสาร')
      )}
    </div>
  );
};

export default AddressSection;