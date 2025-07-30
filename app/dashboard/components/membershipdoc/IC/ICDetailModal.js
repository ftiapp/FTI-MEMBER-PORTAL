'use client';

import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function ICDetailModal({ application, onClose }) {
  if (!application) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'รอพิจารณา', color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'อนุมัติ', color: 'bg-green-100 text-green-800' },
      2: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: 'ไม่ทราบสถานะ', color: 'bg-gray-100 text-gray-800' };
  };

  // Helper components
  const Section = ({ title, children, className = '' }) => (
    <div className={className}>
      <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
      {children}
    </div>
  );

  const InfoCard = ({ title, value }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <p className="text-sm text-gray-900">{value || '-'}</p>
    </div>
  );

  const RepresentativeCard = ({ representative }) => {
    if (!representative) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">ผู้แทน</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ชื่อ-นามสกุล:</span>
            <span className="text-sm text-gray-900">
              {representative.firstNameThai && representative.lastNameThai 
                ? `${representative.firstNameThai} ${representative.lastNameThai}` 
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ตำแหน่ง:</span>
            <span className="text-sm text-gray-900">{representative.position || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">เบอร์โทรศัพท์:</span>
            <span className="text-sm text-gray-900">{representative.phone || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">อีเมล:</span>
            <span className="text-sm text-gray-900">{representative.email || '-'}</span>
          </div>
        </div>
      </div>
    );
  };

  const BusinessTypesCard = ({ title, businessTypes }) => {
    if (!businessTypes || businessTypes.length === 0) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
        <div className="space-y-2">
          {businessTypes.map((type, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-900">{type.businessTypeName || type.name || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProductsCard = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">ผลิตภัณฑ์/บริการ</h4>
        <div className="space-y-2">
          {products.map((product, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">{product.productName || product.name || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FileCard = ({ documents }) => {
    if (!documents || documents.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">ไม่มีเอกสารแนบ</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{doc.fileName || 'ไฟล์เอกสาร'}</p>
              <p className="text-xs text-gray-500">{doc.documentType || 'เอกสาร'}</p>
            </div>
          </div>
        ))}
      </div>
    );
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
            <Section title="ข้อมูลผู้สมัคร">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="เลขบัตรประจำตัวประชาชน" value={application.idCardNumber} />
                <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={`${application.firstNameTh || ''} ${application.lastNameTh || ''}`} />
                <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={`${application.firstNameEn || ''} ${application.lastNameEn || ''}`} />
                <InfoCard title="อีเมล" value={application.email} />
                <InfoCard title="เบอร์โทรศัพท์" value={application.phone} />
              </div>
            </Section>

            {/* ที่อยู่ */}
            <Section title="ที่อยู่" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="เลขที่" value={application.address?.address_number} />
                <InfoCard title="หมู่" value={application.address?.moo} />
                <InfoCard title="ซอย" value={application.address?.soi} />
                <InfoCard title="ถนน" value={application.address?.street} />
                <InfoCard title="ตำบล/แขวง" value={application.address?.sub_district} />
                <InfoCard title="อำเภอ/เขต" value={application.address?.district} />
                <InfoCard title="จังหวัด" value={application.address?.province} />
                <InfoCard title="รหัสไปรษณีย์" value={application.address?.postal_code} />
              </div>
            </Section>

            {/* ข้อมูลผู้แทน */}
            <Section title="ข้อมูลผู้แทน">
              <div className="grid grid-cols-1 gap-4">
                <RepresentativeCard representative={application.representative} />
              </div>
            </Section>

            {/* ข้อมูลธุรกิจ */}
            <Section title="ข้อมูลธุรกิจ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BusinessTypesCard title="ประเภทธุรกิจ" businessTypes={application.businessTypes} />
                <ProductsCard products={application.products} />
              </div>
            </Section>

            {/* เอกสารแนบ */}
            <Section title="เอกสารแนบ">
              <div className="space-y-3">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc, index) => (
                    <FileCard 
                      key={index}
                      fileName={doc.file_name || 'ไม่ได้อัปโหลด'} 
                      description={doc.document_type || 'เอกสาร'}
                      cloudinaryUrl={doc.cloudinary_url}
                    />
                  ))
                ) : (
                  <FileCard 
                    fileName="ไม่ได้อัปโหลด" 
                    description="สำเนาบัตรประชาชน" 
                  />
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
