'use client';

/**
 * คอมโพเนนต์สำหรับแสดงสรุปข้อมูลการสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 */
export default function SummarySection({ formData }) {
  // ฟังก์ชันสำหรับแสดงชื่อไฟล์
  const getFileName = (file) => {
    if (file && typeof file === 'object' && file.name) {
      return file.name;
    }
    return 'ไม่ได้อัพโหลด';
  };

  // ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรมที่เลือก
  const getSelectedIndustrialGroups = () => {
    if (!formData.industrialGroups || formData.industrialGroups.length === 0) {
      return 'ไม่ได้เลือก';
    }
    return formData.industrialGroups.join(', ');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">สรุปข้อมูลการสมัครสมาชิก</h2>
      <p className="text-sm text-gray-500 mb-4">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการสมัคร</p>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">ข้อมูลบริษัท</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ชื่อบริษัท</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.companyName || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เลขประจำตัวผู้เสียภาษี</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.taxId || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">อีเมลบริษัท</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.companyEmail || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์บริษัท</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.companyPhone || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ที่อยู่บริษัท</dt>
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
          <h3 className="text-lg leading-6 font-medium text-gray-900">ข้อมูลผู้แทนนิติบุคคล</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาไทย)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.firstNameThai} {formData.lastNameThai}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล (ภาษาอังกฤษ)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.firstNameEng} {formData.lastNameEng}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ตำแหน่ง</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.position || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เลขบัตรประจำตัวประชาชน</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.idCardNumber || '-'}</dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.email || '-'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.phone || '-'}</dd>
            </div>
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
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.businessType || '-'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">กลุ่มอุตสาหกรรม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getSelectedIndustrialGroups()}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">สภาอุตสาหกรรมจังหวัด</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.provincialChapter || '-'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ทุนจดทะเบียน</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.registeredCapital ? `${formData.registeredCapital.toLocaleString()} บาท` : '-'}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">จำนวนพนักงาน</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formData.employeeCount ? `${formData.employeeCount.toLocaleString()} คน` : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">เอกสารประกอบการสมัคร</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">หนังสือรับรองบริษัท</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getFileName(formData.companyRegistration)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company Profile</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getFileName(formData.companyProfile)}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">บัญชีรายชื่อผู้ถือหุ้น</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getFileName(formData.shareholderList)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ใบทะเบียนภาษีมูลค่าเพิ่ม</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getFileName(formData.vatRegistration)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>โปรดตรวจสอบข้อมูลให้ถูกต้อง</strong> หลังจากยืนยันการสมัครแล้ว ท่านจะไม่สามารถแก้ไขข้อมูลได้
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
