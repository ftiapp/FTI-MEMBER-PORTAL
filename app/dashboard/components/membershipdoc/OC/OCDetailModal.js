'use client';

import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function OCDetailModal({ application, onClose }) {
  if (!application) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'รอพิจารณา', color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'อนุมัติ', color: 'bg-green-100 text-green-800' },
      2: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: 'ไม่ทราบสถานะ', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              รายละเอียดใบสมัครสมาชิก {application.memberType}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* ข้อมูลบริษัท */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">ข้อมูลบริษัท</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">ชื่อบริษัท (ไทย)</label>
                  <p className="text-sm text-gray-900">{application.companyNameTh || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">ชื่อบริษัท (อังกฤษ)</label>
                  <p className="text-sm text-gray-900">{application.companyNameEng || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">เลขทะเบียนนิติบุคคล</label>
                  <p className="text-sm text-gray-900">{application.taxId || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">เว็บไซต์</label>
                  <p className="text-sm text-gray-900">{application.website || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">จำนวนพนักงาน</label>
                  <p className="text-sm text-gray-900">{application.employeeCount || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">ทุนจดทะเบียน</label>
                  <p className="text-sm text-gray-900">{application.capital ? `${Number(application.capital).toLocaleString()} บาท` : '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">อีเมล</label>
                  <p className="text-sm text-gray-900">{application.email || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                  <p className="text-sm text-gray-900">{application.phone || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">สถานะ</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status).color}`}>
                    {getStatusBadge(application.status).text}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">วันที่ส่ง</label>
                  <p className="text-sm text-gray-900">{format(new Date(application.createdAt), 'dd MMMM yyyy HH:mm', { locale: th })}</p>
                </div>
              </div>
            </div>

            {/* ที่อยู่บริษัท */}
            {(application.addressNumber || application.moo || application.soi || application.street || application.subDistrict || application.district || application.province || application.postalCode) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ที่อยู่บริษัท</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">เลขที่</label>
                    <p className="text-sm text-gray-900">{application.addressNumber || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">หมู่</label>
                    <p className="text-sm text-gray-900">{application.moo || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ซอย</label>
                    <p className="text-sm text-gray-900">{application.soi || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ถนน</label>
                    <p className="text-sm text-gray-900">{application.street || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ตำบล/แขวง</label>
                    <p className="text-sm text-gray-900">{application.subDistrict || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">อำเภอ/เขต</label>
                    <p className="text-sm text-gray-900">{application.district || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">จังหวัด</label>
                    <p className="text-sm text-gray-900">{application.province || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                    <p className="text-sm text-gray-900">{application.postalCode || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ผู้ให้ข้อมูล */}
            {application.contactPerson && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ผู้ให้ข้อมูล</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                    <p className="text-sm text-gray-900">
                      {application.contactPerson.firstNameThai && application.contactPerson.lastNameThai 
                        ? `${application.contactPerson.firstNameThai} ${application.contactPerson.lastNameThai}` 
                        : '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
                    <p className="text-sm text-gray-900">{application.contactPerson.position || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <p className="text-sm text-gray-900">{application.contactPerson.phone || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                    <p className="text-sm text-gray-900">{application.contactPerson.email || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ผู้แทนบริษัท */}
            {application.representatives && application.representatives.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ผู้แทนบริษัท</h4>
                <div className="space-y-4">
                  {application.representatives.map((rep, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                          <p className="text-sm text-gray-900">
                            {rep.firstNameThai && rep.lastNameThai 
                              ? `${rep.firstNameThai} ${rep.lastNameThai}` 
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
                          <p className="text-sm text-gray-900">{rep.position || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                          <p className="text-sm text-gray-900">{rep.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">อีเมล</label>
                          <p className="text-sm text-gray-900">{rep.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ประเภทธุรกิจ */}
            {application.businessTypes && application.businessTypes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ประเภทธุรกิจ</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    {application.businessTypes.map((type, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">{type.businessTypeName || type.name || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ผลิตภัณฑ์/บริการ */}
            {application.products && application.products.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ผลิตภัณฑ์/บริการ</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    {application.products.map((product, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">{product.productName || product.name || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* กลุ่มอุตสาหกรรม */}
            {application.industryGroups && application.industryGroups.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">กลุ่มอุตสาหกรรม</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    {application.industryGroups.map((group, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">{group.industryGroupName || group.name || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* สภาอุตสาหกรรมจังหวัด */}
            {application.provinceChapters && application.provinceChapters.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">สภาอุตสาหกรรมจังหวัด</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    {application.provinceChapters.map((chapter, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">{chapter.provinceChapterName || chapter.name || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* เอกสารที่แนบมา */}
            {application.documents && application.documents.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">เอกสารที่แนบมา</h4>
                <div className="space-y-2">
                  {application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">{doc.documentType || 'เอกสาร'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
