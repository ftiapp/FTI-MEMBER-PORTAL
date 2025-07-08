// components/SummarySection.js
'use client';

export default function SummarySection({ formData }) {
  // ฟังก์ชันสำหรับแสดงชื่อไฟล์
  const getFileName = (file) => {
    if (file && typeof file === 'object' && file.name) {
      return file.name;
    }
    return 'ไม่ได้อัพโหลด';
  };

  // ฟังก์ชันสำหรับแสดงประเภทธุรกิจที่เลือก
  const getSelectedBusinessTypes = () => {
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
      return 'ไม่ได้เลือก';
    }

    const types = Object.keys(formData.businessTypes).map(type => {
      if (type === 'other') {
        return `อื่นๆ: ${formData.otherBusinessTypeDetail || ''}`;
      }
      return type;
    });

    return types.join(', ');
  };

  // ฟังก์ชันสำหรับแสดงรายชื่อผู้แทนสมาคม
  const renderRepresentatives = () => {
    if (!formData.representatives || formData.representatives.length === 0) {
      return (
        <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">ผู้แทนสมาคม</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">ไม่มีข้อมูล</dd>
        </div>
      );
    }

    return formData.representatives.map((rep, index) => (
      <div key={index} className={index % 2 === 0 ? "bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" : "bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"}>
        <dt className="text-sm font-medium text-gray-500">ผู้แทนสมาคม {index + 1}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          <div className="space-y-2">
            <div>
              <span className="text-gray-500 mr-2">ชื่อ-นามสกุล (ไทย):</span>
              <span>{rep.firstNameThai} {rep.lastNameThai}</span>
            </div>
            <div>
              <span className="text-gray-500 mr-2">ชื่อ-นามสกุล (อังกฤษ):</span>
              <span>{rep.firstNameEng} {rep.lastNameEng}</span>
            </div>
            <div>
              <span className="text-gray-500 mr-2">อีเมล:</span>
              <span>{rep.email || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 mr-2">เบอร์โทรศัพท์:</span>
              <span>{rep.phone || '-'}</span>
            </div>
          </div>
        </dd>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">สรุปข้อมูลการสมัครสมาชิก</h2>
      <p className="text-sm text-gray-500 mb-4">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการสมัคร</p>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">ข้อมูลสมาคม</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ชื่อสมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.associationName || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เลขทะเบียนสมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.associationRegistrationNumber || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">อีเมลสมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.associationEmail || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์สมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.associationPhone || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ที่อยู่สมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {[
                  formData.addressNumber,
                  formData.moo ? `หมู่ ${formData.moo}` : '',
                  formData.soi ? `ซอย ${formData.soi}` : '',
                  formData.road ? `ถนน ${formData.road}` : '',
                  formData.subDistrict ? `ตำบล/แขวง ${formData.subDistrict}` : '',
                  formData.district ? `อำเภอ/เขต ${formData.district}` : '',
                  formData.province ? `จังหวัด ${formData.province}` : '',
                  formData.postalCode
                ].filter(Boolean).join(' ')}              
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">ข้อมูลผู้แทนสมาคม</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {renderRepresentatives()}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">ข้อมูลธุรกิจ</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ประเภทธุรกิจ</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getSelectedBusinessTypes()}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">จำนวนสมาชิก</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.memberCount || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ทุนจดทะเบียน (บาท)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.registeredCapital ? formData.registeredCapital.toLocaleString() : '-'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ประเภทโรงงาน</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.factoryType === 'type1' ? 'ประเภทที่ 1 (มีเครื่องจักรมากกว่า 50 แรงม้า)' : 
                 formData.factoryType === 'type2' ? 'ประเภทที่ 2 (ไม่มีเครื่องจักร / มีเครื่องจักรต่ำกว่า 5 แรงม้า)' : '-'}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ลักษณะธุรกิจโดยย่อ</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.businessDescription || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">กลุ่มอุตสาหกรรม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.industrialGroup || 'ไม่ได้เลือก'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">สภาอุตสาหกรรมจังหวัด</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.provincialCouncil || 'ไม่ได้เลือก'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">เอกสารแนบ</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">หนังสือรับรองสมาคม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getFileName(formData.associationCertificate)}</dd>
            </div>
            
            {formData.factoryType === 'type1' && (
              <>
                <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ใบอนุญาตประกอบกิจการโรงงาน (รง.4)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getFileName(formData.factoryLicense)}</dd>
                </div>
                <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getFileName(formData.industrialEstateLicense)}</dd>
                </div>
              </>
            )}
            
            {formData.factoryType === 'type2' && (
              <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">รูปถ่ายเครื่องจักร/กระบวนการผลิต</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.productionImages && formData.productionImages.length > 0 
                    ? `${formData.productionImages.length} ไฟล์` 
                    : 'ไม่ได้อัพโหลด'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> การสมัครสมาชิกจะสมบูรณ์เมื่อท่านได้รับการยืนยันจากทางสภาอุตสาหกรรมแห่งประเทศไทย
          และชำระค่าธรรมเนียมการสมัครเรียบร้อยแล้ว
        </p>
      </div>
    </div>
  );
}
