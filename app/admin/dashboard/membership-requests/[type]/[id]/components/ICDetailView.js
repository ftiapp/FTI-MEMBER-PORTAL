import React from 'react';

const ICDetailView = ({ application, industrialGroups, provincialChapters, handleViewDocument }) => {
  return (
    <div className="space-y-6">
      {/* ข้อมูลผู้สมัคร */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้สมัคร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
            <p className="font-medium">{application.first_name_th || application.firstNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
            <p className="font-medium">{application.last_name_th || application.lastNameTh || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
            <p className="font-medium">{application.first_name_en || application.firstNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
            <p className="font-medium">{application.last_name_en || application.lastNameEn || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เลขบัตรประชาชน</p>
            <p className="font-medium">{application.id_card_number || application.idCard || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">อีเมล</p>
            <p className="font-medium">{application.email || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
            <p className="font-medium">{application.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">เว็บไซต์</p>
            <p className="font-medium">{application.website || '-'}</p>
          </div>
        </div>
      </div>

      {/* ข้อมูลที่อยู่ */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลที่อยู่</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">บ้านเลขที่</p>
            <p className="font-medium">{application.address_number || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">หมู่</p>
            <p className="font-medium">{application.moo || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ซอย</p>
            <p className="font-medium">{application.soi || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ถนน</p>
            <p className="font-medium">{application.street || application.road || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">ตำบล/แขวง</p>
            <p className="font-medium">{application.sub_district || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">อำเภอ/เขต</p>
            <p className="font-medium">{application.district || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">จังหวัด</p>
            <p className="font-medium">{application.province || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">รหัสไปรษณีย์</p>
            <p className="font-medium">{application.postal_code || '-'}</p>
          </div>
        </div>
      </div>

      {/* ข้อมูลธุรกิจ */}
      {application.businessTypes && application.businessTypes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลธุรกิจ</h3>
          
          {/* ประเภทธุรกิจ */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-gray-700">ประเภทธุรกิจ</h4>
            <div className="flex flex-wrap gap-2">
              {application.businessTypes.map((businessType, index) => {
                const getBusinessTypeName = (type) => {
                  const types = {
                    'manufacturer': 'ผู้ผลิต',
                    'distributor': 'ผู้จัดจำหน่าย',
                    'importer': 'ผู้นำเข้า',
                    'exporter': 'ผู้ส่งออก',
                    'service': 'ผู้ให้บริการ',
                    'other': 'อื่นๆ'
                  };
                  return types[type] || type;
                };
                
                return (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {getBusinessTypeName(businessType.business_type)}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* สินค้าและบริการ */}
          {application.products && application.products.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-700">สินค้าและบริการ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.products.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (ไทย)</p>
                        <p className="font-medium">{product.name_th || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">ชื่อสินค้า/บริการ (อังกฤษ)</p>
                        <p className="font-medium">{product.name_en || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ข้อมูลผู้แทน */}
      {application.representatives && application.representatives.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">ข้อมูลผู้แทน</h3>
          <div className="space-y-4">
            {application.representatives.map((rep, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">ชื่อ (ไทย)</p>
                    <p className="font-medium">{rep.first_name_th || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">นามสกุล (ไทย)</p>
                    <p className="font-medium">{rep.last_name_th || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ชื่อ (อังกฤษ)</p>
                    <p className="font-medium">{rep.first_name_en || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">นามสกุล (อังกฤษ)</p>
                    <p className="font-medium">{rep.last_name_en || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ตำแหน่ง</p>
                    <p className="font-medium">{rep.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{rep.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">อีเมล</p>
                    <p className="font-medium">{rep.email || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      {((application.industrialGroupIds && application.industrialGroupIds.length > 0) || (application.provincialChapterIds && application.provincialChapterIds.length > 0)) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด</h3>
          
          {/* กลุ่มอุตสาหกรรม */}
          {application.industrialGroupIds && application.industrialGroupIds.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3 text-gray-700">กลุ่มอุตสาหกรรม</h4>
              <div className="space-y-2">
                {application.industrialGroupIds.map((group, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {industrialGroups[group.id] || `รหัส: ${group.id}`}
                      </span>
                      {industrialGroups[group.id] && (
                        <span className="text-xs text-gray-500 ml-2">(รหัส: {group.id})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* สภาอุตสาหกรรมจังหวัด */}
          {application.provincialChapterIds && application.provincialChapterIds.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-700">สภาอุตสาหกรรมจังหวัด</h4>
              <div className="space-y-2">
                {application.provincialChapterIds.map((chapter, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {provincialChapters[chapter.id] || `รหัส: ${chapter.id}`}
                      </span>
                      {provincialChapters[chapter.id] && (
                        <span className="text-xs text-gray-500 ml-2">(รหัส: {chapter.id})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ข้อมูลเอกสาร */}
      {application.documents && application.documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">เอกสารแนบ</h3>
          <div className="space-y-2">
            {application.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-sm">{doc.document_name || `เอกสาร ${index + 1}`}</p>
                  <p className="text-gray-500 text-xs">{doc.file_path || '-'}</p>
                </div>
                {doc.file_path && (
                  <button 
                    onClick={() => handleViewDocument(doc.file_path)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title="ดูเอกสาร"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดู
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ICDetailView;
