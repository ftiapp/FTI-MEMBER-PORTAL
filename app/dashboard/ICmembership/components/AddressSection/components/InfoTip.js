export default function InfoTip() {
    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-sm font-medium text-green-800 mb-2">💡 เคล็ดลับการใช้งาน</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• พิมพ์ชื่อตำบลเพื่อค้นหาอัตโนมัติ ระบบจะเติมอำเภอ จังหวัด และรหัสไปรษณีย์ให้</li>
          <li>• หรือพิมพ์รหัสไปรษณีย์เพื่อค้นหาข้อมูลที่อยู่</li>
          <li>• ข้อมูลที่มี <span className="text-red-500">*</span> เป็นข้อมูลที่จำเป็นต้องกรอก</li>
        </ul>
      </div>
    );
  }