// แสดงรายละเอียดของสมาชิกที่เลือก
'use client';

export default function UpdateDetail({ member, onApprove, onReject, isProcessing, comment, setComment }) {
  if (!member) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center h-64">
        <p className="text-lg text-black font-bold">เลือกสมาชิกเพื่อดูรายละเอียด</p>
        <p className="text-sm text-black font-semibold mt-2">คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="border-b border-black pb-4">
        <h2 className="text-xl font-bold text-black">รายละเอียดสมาชิก</h2>
        <p className="text-sm text-black font-medium mt-1">แก้ไขล่าสุด: {member.updated_at ? new Date(member.updated_at).toLocaleString('th-TH') : '-'}</p>
        {(member.admin_name) && (
          <p className="text-sm text-black font-medium mt-1">
            <span className="font-bold">ผู้ดำเนินการ:</span> {member.admin_name}
          </p>
        )}
        <p className="text-sm text-black font-medium mt-1">
          <span className="font-bold">สถานะ:</span> 
          <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${member.Admin_Submit === 1 ? 'bg-green-100 text-green-800' : member.Admin_Submit === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {member.Admin_Submit === 1 ? 'อนุมัติแล้ว' : member.Admin_Submit === 0 ? 'ปฏิเสธแล้ว' : 'รออนุมัติ'}
          </span>
        </p>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-black font-semibold"><span className="font-bold text-black">ชื่อบริษัท:</span> {member.company_name}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">รหัสสมาชิก:</span> {member.MEMBER_CODE}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">ประเภท:</span> {member.company_type}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">เลขทะเบียนนิติบุคคล:</span> {member.registration_number}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">เลขประจำตัวผู้เสียภาษี:</span> {member.tax_id}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">ที่อยู่:</span> {member.address}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">จังหวัด:</span> {member.province}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">รหัสไปรษณีย์:</span> {member.postal_code}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">โทรศัพท์:</span> {member.phone}</p>
            <p className="text-black font-semibold"><span className="font-bold text-black">เว็บไซต์:</span> {member.website}</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-black font-bold mb-1">หมายเหตุ (สำหรับแอดมิน):</label>
          <textarea
            className="w-full border rounded p-2 text-black"
            rows={2}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
            onClick={onApprove}
            disabled={isProcessing}
          >อนุมัติ</button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
            onClick={onReject}
            disabled={isProcessing}
          >ปฏิเสธ</button>
        </div>
      </div>
    </div>
  );
}
