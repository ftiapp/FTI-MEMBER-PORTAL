import React from 'react';

const AddressSection = ({ address }) => {
  if (!address) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลที่อยู่</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-sm">บ้านเลขที่</p>
          <p className="font-medium">{address.address_number || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">หมู่</p>
          <p className="font-medium">{address.moo || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">ซอย</p>
          <p className="font-medium">{address.soi || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">ถนน</p>
          <p className="font-medium">{address.street || address.road || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">ตำบล/แขวง</p>
          <p className="font-medium">{address.sub_district || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">อำเภอ/เขต</p>
          <p className="font-medium">{address.district || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">จังหวัด</p>
          <p className="font-medium">{address.province || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">รหัสไปรษณีย์</p>
          <p className="font-medium">{address.postal_code || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
          <p className="font-medium">{address.phone || address.companyPhone || address.company_phone || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">อีเมล</p>
          <p className="font-medium">{address.email || address.companyEmail || address.company_email || '-'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">เว็บไซต์</p>
          <p className="font-medium">{address.website || address.companyWebsite || address.company_website || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
