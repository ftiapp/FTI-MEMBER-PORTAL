import { useMemo } from "react";

export function usePrenameHandling(formData, setFormData) {
  // Mapping Thai prename to English prename
  const prenameMapping = useMemo(
    () => ({
      นาย: "Mr.",
      นาง: "Mrs.",
      นางสาว: "Miss",
      อื่นๆ: "Other",
    }),
    [],
  );

  const handlePrenameThaiChange = (value) => {
    const englishPrename = prenameMapping[value] || "";
    setFormData((prev) => ({
      ...prev,
      prename_th: value,
      prenameTh: value,
      prename_en: englishPrename,
      prenameEn: englishPrename,
      // ล้างค่า prename_other เมื่อเปลี่ยนค่า prename_th ที่ไม่ใช่ 'อื่นๆ'
      prename_other: value === "อื่นๆ" ? prev.prename_other : "",
      prenameOther: value === "อื่นๆ" ? prev.prenameOther : "",
      // ล้างค่า prename_other_en เมื่อเปลี่ยนค่า prename_th ที่ไม่ใช่ 'อื่นๆ'
      prename_other_en: value === "อื่นๆ" ? prev.prename_other_en : "",
      prenameOtherEn: value === "อื่นๆ" ? prev.prenameOtherEn : "",
    }));
  };

  const handlePrenameEnglishChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      prename_en: value,
      prenameEn: value,
      // ล้างค่า prename_other_en เมื่อเปลี่ยนค่า prename_en ที่ไม่ใช่ 'Other'
      prename_other_en: value === "Other" ? prev.prename_other_en : "",
      prenameOtherEn: value === "Other" ? prev.prenameOtherEn : "",
    }));
  };

  return {
    prenameMapping,
    handlePrenameThaiChange,
    handlePrenameEnglishChange,
  };
}
