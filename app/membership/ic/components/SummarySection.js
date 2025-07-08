'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';

export default function SummarySection({ formData }) {
  // Format address for display
  const formattedAddress = useMemo(() => {
    const address = formData.address || {};
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.subDistrict && `ตำบล/แขวง ${address.subDistrict}`,
      address.district && `อำเภอ/เขต ${address.district}`,
      address.province && `จังหวัด ${address.province}`,
      address.postalCode && `รหัสไปรษณีย์ ${address.postalCode}`
    ].filter(Boolean);
    
    return parts.join(' ');
  }, [formData.address]);

  // Get selected business types
  const selectedBusinessTypes = useMemo(() => {
    if (!formData.businessTypes) return [];
    
    const BUSINESS_TYPE_LABELS = {
      manufacturer: 'ผู้ผลิต',
      distributor: 'ผู้จัดจำหน่าย',
      importer: 'ผู้นำเข้า',
      exporter: 'ผู้ส่งออก',
      service_provider: 'ผู้ให้บริการ',
      other: 'อื่นๆ'
    };
    
    return Object.keys(formData.businessTypes)
      .map(key => {
        if (key === 'other') {
          return `${BUSINESS_TYPE_LABELS[key]} (${formData.otherBusinessTypeDetail || ''})`;
        }
        return BUSINESS_TYPE_LABELS[key];
      });
  }, [formData.businessTypes, formData.otherBusinessTypeDetail]);

  // Format products for display
  const formattedProducts = useMemo(() => {
    return formData.products?.map(product => ({
      nameTh: product.nameTh || '-',
      nameEn: product.nameEn || '-'
    })) || [];
  }, [formData.products]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">สรุปข้อมูล</h2>
        <p className="text-blue-100 text-sm mt-1">ตรวจสอบข้อมูลก่อนส่งใบสมัคร</p>
      </div>
      
      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="space-y-8">
            {/* Applicant Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลผู้สมัคร
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">เลขบัตรประจำตัวประชาชน</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.idCardNumber || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาไทย)</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.firstNameThai} {formData.lastNameThai}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาอังกฤษ)</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.firstNameEng} {formData.lastNameEng}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">อีเมล</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.email || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.phone || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์มือถือ</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.mobile || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ที่อยู่
              </h3>
              
              <div>
                <p className="text-sm font-medium text-gray-500">ที่อยู่</p>
                <p className="mt-1 text-sm text-gray-900">{formattedAddress || '-'}</p>
              </div>
            </div>
            
            {/* Industrial Group and Provincial Chapter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">กลุ่มอุตสาหกรรม</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.industrialGroup || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">สภาอุตสาหกรรมจังหวัด</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.provincialChapter || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Representative Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลผู้แทน
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาไทย)</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.representative?.firstNameThai} {formData.representative?.lastNameThai}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาอังกฤษ)</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.representative?.firstNameEng} {formData.representative?.lastNameEng}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">อีเมล</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.representative?.email || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="mt-1 text-sm text-gray-900">{formData.representative?.phone || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Business Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลธุรกิจ
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ประเภทธุรกิจ</p>
                  <div className="mt-1">
                    {selectedBusinessTypes.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-900">
                        {selectedBusinessTypes.map((type, index) => (
                          <li key={index}>{type}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-900">-</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">สินค้า/บริการ</p>
                  {formattedProducts.length > 0 ? (
                    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ลำดับ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ชื่อสินค้า/บริการ (ภาษาไทย)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ชื่อสินค้า/บริการ (ภาษาอังกฤษ)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formattedProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.nameTh}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.nameEn}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">-</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Document Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                เอกสารแนบ
              </h3>
              
              <div>
                <p className="text-sm font-medium text-gray-500">สำเนาบัตรประชาชน</p>
                <p className="mt-1 text-sm text-gray-900">
                  {formData.idCardDocument ? formData.idCardDocument.name : 'ไม่มีเอกสารแนบ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SummarySection.propTypes = {
  formData: PropTypes.shape({
    idCardNumber: PropTypes.string,
    firstNameThai: PropTypes.string,
    lastNameThai: PropTypes.string,
    firstNameEng: PropTypes.string,
    lastNameEng: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    mobile: PropTypes.string,
    address: PropTypes.object,
    industrialGroup: PropTypes.string,
    provincialChapter: PropTypes.string,
    representative: PropTypes.object,
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
    products: PropTypes.array,
    idCardDocument: PropTypes.object
  }).isRequired
};
