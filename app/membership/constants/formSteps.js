/**
 * Shared form step constants
 * Used by all membership forms (AC, OC, IC, AM)
 */

/**
 * Standard 5-step form structure
 * Step names can be customized per form type
 */
export const STANDARD_STEPS = [
  { id: 1, name: "ข้อมูลองค์กร" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

/**
 * AC (Associate Member) form steps
 */
export const AC_STEPS = [
  { id: 1, name: "ข้อมูลบริษัท" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

/**
 * OC (Ordinary Member - Company) form steps
 */
export const OC_STEPS = [
  { id: 1, name: "ข้อมูลบริษัท" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

/**
 * IC (Individual Member) form steps
 */
export const IC_STEPS = [
  { id: 1, name: "ข้อมูลผู้สมัคร" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

/**
 * AM (Association Member) form steps
 */
export const AM_STEPS = [
  { id: 1, name: "ข้อมูลสมาคม" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

/**
 * Get steps by member type
 * @param {string} memberType - Member type (ac, oc, ic, am)
 * @returns {Array} - Steps array
 */
export const getStepsByMemberType = (memberType) => {
  const stepsMap = {
    ac: AC_STEPS,
    oc: OC_STEPS,
    ic: IC_STEPS,
    am: AM_STEPS,
  };

  return stepsMap[memberType?.toLowerCase()] || STANDARD_STEPS;
};
