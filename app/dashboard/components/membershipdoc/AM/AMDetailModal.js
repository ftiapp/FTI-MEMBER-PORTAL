'use client';

import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AMDetailModal({ application, onClose }) {
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
            {/* ข้อมูลผู้สมัคร */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">ข้อมูลผู้สมัคร</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">เลขบัตรประจำตัวประชาชน</label>
                  <p className="text-sm text-gray-900">{application.idCardNumber || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล (ไทย)</label>
                  <p className="text-sm text-gray-900">{application.firstNameThai && application.lastNameThai ? `${application.firstNameThai} ${application.lastNameThai}` : '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล (อังกฤษ)</label>
                  <p className="text-sm text-gray-900">{application.firstNameEng && application.lastNameEng ? `${application.firstNameEng} ${application.lastNameEng}` : '-'}</p>
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

            {/* ที่อยู่ */}
            {(application.addressNumber || application.moo || application.soi || application.street || application.subDistrict || application.district || application.province || application.postalCode) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ที่อยู่</h4>
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

            {/* ข้อมูลผู้แทน */}
            {application.representative && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ข้อมูลผู้แทน</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                    <p className="text-sm text-gray-900">
                      {application.representative.firstNameThai && application.representative.lastNameThai 
                        ? `${application.representative.firstNameThai} ${application.representative.lastNameThai}` 
                        : '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                    <p className="text-sm text-gray-900">{application.representative.email || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <p className="text-sm text-gray-900">{application.representative.phone || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
                    <p className="text-sm text-gray-900">{application.representative.position || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ข้อมูลธุรกิจ */}
            {(application.businessTypes || application.products) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ข้อมูลธุรกิจ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.businessTypes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">ประเภทธุรกิจ</label>
                      <div className="mt-2 space-y-1">
                        {Object.keys(application.businessTypes).filter(key => application.businessTypes[key]).map((key, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {key === 'other' ? 'อื่นๆ' : key}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {application.products && application.products.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">สินค้า/บริการ</label>
                      <div className="mt-2 space-y-1">
                        {application.products.map((product, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{product.nameTh || '-'}</p>
                            <p className="text-gray-600">{product.nameEn || '-'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
