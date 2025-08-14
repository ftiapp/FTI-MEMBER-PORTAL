import React, { useState } from 'react';

const AddressSection = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application?.addresses || []);
  
  // Check if we have multiple addresses or just one
  const hasMultipleAddresses = application?.addresses && application.addresses.length > 0;
  const hasSingleAddress = application?.address && !hasMultipleAddresses;
  
  if (!hasMultipleAddresses && !hasSingleAddress) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(application?.addresses ? [...application.addresses] : [application.address]);
  };

  const handleSave = async () => {
    try {
      await onUpdate('addresses', editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating addresses:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(application?.addresses ? [...application.addresses] : [application.address]);
  };

  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...editData];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setEditData(updatedAddresses);
  };

  const renderAddressCard = (addr, title, index = 0) => (
    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h4 className="text-xl font-semibold text-blue-900 mb-4 border-b border-blue-300 pb-2">
        {title}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(addr.building || isEditing) && (
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">อาคาร</p>
            {isEditing ? (
              <input
                type="text"
                value={addr.building || ''}
                onChange={(e) => updateAddress(index, 'building', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่ออาคาร"
              />
            ) : (
              <p className="text-base text-gray-900">{addr.building}</p>
            )}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">บ้านเลขที่</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.addressNumber || ''}
              onChange={(e) => updateAddress(index, 'addressNumber', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="บ้านเลขที่"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.addressNumber || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">หมู่</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.moo || ''}
              onChange={(e) => updateAddress(index, 'moo', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="หมู่"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.moo || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ซอย</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.soi || ''}
              onChange={(e) => updateAddress(index, 'soi', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ซอย"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.soi || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ถนน</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.street || ''}
              onChange={(e) => updateAddress(index, 'street', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ถนน"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.street || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">ตำบล/แขวง</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.subDistrict || ''}
              onChange={(e) => updateAddress(index, 'subDistrict', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ตำบล/แขวง"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.subDistrict || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">อำเภอ/เขต</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.district || ''}
              onChange={(e) => updateAddress(index, 'district', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อำเภอ/เขต"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.district || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">จังหวัด</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.province || ''}
              onChange={(e) => updateAddress(index, 'province', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="จังหวัด"
            />
          ) : (
            <p className="text-base text-gray-900">{addr.province || '-'}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">รหัสไปรษณีย์</p>
          {isEditing ? (
            <input
              type="text"
              value={addr.postalCode || ''}
              onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="รหัสไปรษณีย์"
            />
          ) : (
            <p className="text-base text-gray-900 font-mono">{addr.postalCode || '-'}</p>
          )}
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
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">
          ข้อมูลที่อยู่
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไขข้อมูลที่อยู่"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไข
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              บันทึก
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              ยกเลิก
            </button>
          </div>
        )}
      </div>
      
      {hasMultipleAddresses ? (
        // Display all addresses with their types
        (isEditing ? editData : application.addresses).map((addr, index) => 
          renderAddressCard(addr, `ที่อยู่ประเภท ${addr.addressType}`, index)
        )
      ) : (
        // Display single address (fallback)
        renderAddressCard(isEditing ? editData[0] : application.address, 'ที่อยู่จัดส่งเอกสาร')
      )}
    </div>
  );
};

export default AddressSection;