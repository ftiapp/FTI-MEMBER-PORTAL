/**
 * Filter options for the operations list
 */
export const operationTypeOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'ยืนยันสมาชิกเดิม', label: 'ยืนยันสมาชิกเดิม' },
  { value: 'ติดต่อเจ้าหน้าที่', label: 'ติดต่อเจ้าหน้าที่' },
  { value: 'แก้ไขข้อมูลสมาชิก', label: 'แก้ไขข้อมูลสมาชิก' },
  { value: 'แก้ไขข้อมูลส่วนตัว', label: 'แก้ไขข้อมูลส่วนตัว' },
];

export const statusOptions = [
  { value: 'pending', label: 'รอการอนุมัติ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ปฏิเสธแล้ว' },
  { value: 'unread', label: 'ยังไม่ได้อ่าน' },
  { value: 'read', label: 'อ่านแล้ว' },
  { value: 'replied', label: 'ตอบกลับแล้ว' },
  { value: 'none', label: 'ไม่มีข้อความ' },
  { value: 'error', label: 'โหลดผิดพลาด' },
];
