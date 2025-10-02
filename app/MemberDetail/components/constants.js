/**
 * Status code mapping
 */
export const statusCodeMap = {
  A: { name: "สมาชิก", active: 1, color: "green" },
  C: { name: "ยกเลิกสมาชิก", active: 1, color: "red" },
  D: { name: "สมาชิกลบชื่อ", active: 1, color: "red" },
  N: { name: "ค้างชำระค่าสมาชิก", active: 1, color: "orange" },
  O: { name: "ยกเลิกสมาชิก/ค้างชำระ", active: 1, color: "red" },
  P: { name: "รออนุมัติยกเลิก", active: 1, color: "yellow" },
  S: { name: "ขอคงสภาพสมาชิก", active: 1, color: "blue" },
  S4: { name: "3 จังหวัดภาคใต้", active: 1, color: "blue" },
  T: { name: "โอนย้ายสถานภาพ/โอนเลขหมาย", active: 1, color: "purple" },
  W: { name: "สมาชิก OTOP รอการแจ้งหนี้", active: 1, color: "yellow" },
  X: { name: "รออนุมัติสมาชิก", active: 1, color: "yellow" },
};

/**
 * Member type code mapping
 */
export const memberTypeCodeMap = {
  11: { name: "สามัญ-โรงงาน (สน)", color: "blue" },
  12: { name: "สามัญ-สมาคมการค้า (สส)", color: "blue" },
  21: { name: "สมทบ-นิติบุคคล (ทน)", color: "green" },
  22: { name: "สมทบ-บุคคลธรรมดา (ทบ)", color: "green" },
};

/**
 * Helper function to get the organization type based on MEMBER_MAIN_GROUP_CODE
 */
export const getOrganizationType = (code) => {
  switch (code) {
    case "000":
      return "สภาอุตสาหกรรมแห่งประเทศไทย";
    case "100":
      return "กลุ่มอุตสาหกรรม";
    case "200":
      return "สภาอุตสาหกรรมจังหวัด";
    default:
      return "ไม่ระบุประเภท";
  }
};

/**
 * Animation variants
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};
